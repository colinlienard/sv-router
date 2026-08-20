/* eslint-disable unicorn/no-unsafe-string-replacement */
import fs from 'node:fs';
import path from 'node:path';

/** @typedef {(string | { name: string; tree: FileTree })[]} FileTree */

/**
 * @typedef {{
 * 	[key: string]: string | string[] | GeneratedRoutes;
 * }} GeneratedRoutes
 */

const SAFE_CHARS = String.raw`[\w\-~@!$&'+,;=]`;

const FILENAME_REGEX = new RegExp(String.raw`(?<=[/.]|^)\(?(${SAFE_CHARS}+)\)?(\.lazy)?\.svelte$`); // any.svelte, any.lazy.svelte, (any).svelte, @any.svelte
const INDEX_FILENAME_REGEX = /(?<=[/.]|^)\(?index\)?(\.lazy)?\.svelte$/; // index.svelte, index.lazy.svelte, (index).svelte
const PARAM_FILENAME_REGEX = new RegExp(
	String.raw`(?<=[/.]|^)\(?(${SAFE_CHARS}*)\[([\w-]+)\]\)?(\.lazy)?\.svelte$`,
); // [any].svelte, [any].lazy.svelte, ([any]).svelte, prefix[any].svelte
const CATCH_ALL_FILENAME_REGEX = /(?<=[/.]|^)\(?\[\.\.\.([\w-]+)\]\)?(\.lazy)?\.svelte$/; // [...any].svelte, [...any].lazy.svelte, ([...any]).svelte
const OUT_OF_LAYOUT_FILENAME_REGEX = new RegExp(
	String.raw`(?<=[/.]|^)\((?:${SAFE_CHARS}*)\[\.?\.?\.?([\w-]+)\]\)(\.lazy)?\.svelte$`,
); // ([any]).svelte, ([...any]).lazy.svelte, (prefix[any]).svelte
const HOOKS_FILENAME_REGEX = /(?<=[/.]|^)(hooks)(\.svelte)?\.(js|ts)$/; // hooks.js, hooks.svelte.js, hooks.ts, hooks.svelte.ts
const META_FILENAME_REGEX = /(?<=[/.]|^)(meta)(\.svelte)?\.(js|ts)$/; // meta.js, meta.svelte.js, meta.ts, meta.svelte.ts

/**
 * @param {string} routesPath
 * @param {{ allLazy?: boolean; base?: string; js?: boolean; ignore?: RegExp[] }} [options]
 * @returns {string}
 */
export function generateRouterCode(routesPath, options) {
	const absoluteRoutesPath = path.join(process.cwd(), routesPath);
	if (!fs.existsSync(absoluteRoutesPath)) {
		throw new Error(`Routes directory not found at \`${routesPath}\``);
	}
	const fileTree = buildFileTree(absoluteRoutesPath, options?.ignore ?? []);
	const routeMap = createRouteMap(fileTree);
	return createRouterCode(routeMap, path.posix.join('..', routesPath), options);
}

/**
 * @param {string} routesPath
 * @param {RegExp[]} ignores
 * @returns {FileTree}
 */
export function buildFileTree(routesPath, ignores) {
	const entries = fs.readdirSync(routesPath);
	/** @type {FileTree} */
	const tree = [];
	for (const entry of entries) {
		const stat = fs.lstatSync(path.join(routesPath, entry));
		if (stat.isDirectory()) {
			tree.push({ name: entry, tree: buildFileTree(path.join(routesPath, entry), ignores) });
			continue;
		}
		if (
			(!entry.endsWith('.svelte') &&
				!HOOKS_FILENAME_REGEX.test(entry) &&
				!META_FILENAME_REGEX.test(entry)) ||
			ignores.some((ignore) => ignore.test(entry))
		) {
			continue;
		}
		tree.push(entry);
	}
	return tree;
}

/**
 * @param {FileTree} fileTree
 * @param {string} prefix
 * @returns {GeneratedRoutes}
 */
export function createRouteMap(fileTree, prefix = '') {
	/** @type {GeneratedRoutes} */
	const result = {};
	for (const entry of fileTree) {
		if (typeof entry === 'string') {
			if (!entry.endsWith('.svelte')) {
				if (HOOKS_FILENAME_REGEX.test(entry)) {
					result['hooks'] = prefix + entry;
					continue;
				}
				if (META_FILENAME_REGEX.test(entry)) {
					result['meta'] = prefix + entry;
					continue;
				}
				continue;
			}

			if (INDEX_FILENAME_REGEX.test(entry)) {
				const replacement = /\.?\(index\)(\.lazy)?\.svelte/.test(entry) ? '()' : '';
				const indexEntry = entry.replace(/\.?\(?index\)?(\.lazy)?\.svelte/, replacement);
				result['/' + (indexEntry ? filePathToRoute(indexEntry) : '')] = prefix + entry;
				continue;
			}

			if (entry === 'layout.svelte' || entry === 'layout.lazy.svelte') {
				result['layout'] = prefix + entry;
				continue;
			}

			if (CATCH_ALL_FILENAME_REGEX.test(entry)) {
				const replacement = OUT_OF_LAYOUT_FILENAME_REGEX.test(entry) ? '(*$1)' : '*$1';
				let key = filePathToRoute(entry.replace(CATCH_ALL_FILENAME_REGEX, replacement));
				if (!key.startsWith('*') && !key.startsWith('(*')) {
					key = '/' + key;
				}
				result[key] = prefix + entry;
				continue;
			}

			if (PARAM_FILENAME_REGEX.test(entry)) {
				const replacement = OUT_OF_LAYOUT_FILENAME_REGEX.test(entry) ? '($1:$2)' : '$1:$2';
				const key = '/' + filePathToRoute(entry.replace(PARAM_FILENAME_REGEX, replacement));
				result[key] = prefix + entry;
				continue;
			}

			result['/' + filePathToRoute(entry.replace('.svelte', ''))] = prefix + entry;
		} else {
			const entryName = filePathToRoute(entry.name);
			const isRouteGroup = /^_[^_[]/.test(entry.name);

			if (isRouteGroup) {
				const childMap = createRouteMap(entry.tree, prefix + entryName + '/');
				mergeRouteGroup(result, childMap);
			} else {
				const paramFolder = entryName.replace(
					new RegExp(String.raw`^(${SAFE_CHARS}*)\[(.*)\]$`),
					'$1:$2',
				);
				result['/' + paramFolder] = createRouteMap(entry.tree, prefix + entryName + '/');
			}
		}
	}
	return result;
}

/**
 * Replace `.` with `/`, but not `...`
 *
 * @param {string} filename
 * @returns {string}
 */
function filePathToRoute(filename) {
	return filename.replaceAll(/\.(?!\.\.)/g, '/');
}

/**
 * @param {GeneratedRoutes} result
 * @param {GeneratedRoutes} childMap
 */
function mergeRouteGroup(result, childMap) {
	const layout = childMap.layout;
	const hooks = childMap.hooks;
	const meta = childMap.meta;
	const hasRootRoute = '/' in childMap;

	for (const [key, val] of Object.entries(childMap)) {
		if (['layout', 'hooks', 'meta'].includes(key)) {
			continue;
		}

		const childMeta =
			typeof val === 'object' && !Array.isArray(val) && 'meta' in val ? val.meta : undefined;
		const mergedMeta =
			childMeta && meta && !hasRootRoute ? [childMeta, meta].flat() : childMeta || meta;

		/** @type {GeneratedRoutes} */
		let routeWithGroupFiles = {};
		if (typeof val === 'string') {
			routeWithGroupFiles = { '/': val };
		} else if (!Array.isArray(val)) {
			routeWithGroupFiles = { ...val };
		}
		if (layout) {
			if (routeWithGroupFiles.layout) {
				routeWithGroupFiles = { '/': routeWithGroupFiles, layout: layout };
			} else {
				routeWithGroupFiles.layout = layout;
			}
		}
		if (hooks) routeWithGroupFiles.hooks = hooks;
		if (mergedMeta) routeWithGroupFiles.meta = /** @type {string | string[]} */ (mergedMeta);
		if (Object.hasOwn(result, key)) {
			throw new Error(`Route conflict at \`${key}\``);
		}

		result[key] = routeWithGroupFiles;
	}
}

/**
 * @param {GeneratedRoutes} routes
 * @param {string} routesPath
 * @param {{ allLazy?: boolean; base?: string; js?: boolean }} [options]
 * @returns {string}
 */
export function createRouterCode(routes, routesPath, { allLazy = false, base, js = false } = {}) {
	if (!routesPath.endsWith('/')) {
		routesPath += '/';
	}

	/** @type {Map<string, string>} */
	const importsMap = new Map();

	/**
	 * Register an import and return the variable name to use, making sure two different files never
	 * end up with the same name (e.g. `[user].svelte` and `@[user].svelte`).
	 *
	 * @param {string} filePath
	 * @returns {string}
	 */
	function addImport(filePath) {
		const name = pathToCorrectCasing(filePath);
		const target = routesPath + filePath;
		let variableName = name;
		let count = 1;
		while (importsMap.has(variableName) && importsMap.get(variableName) !== target) {
			variableName = name + ++count;
		}
		importsMap.set(variableName, target);
		return variableName;
	}

	const withImports = (function handleImports(routes, routesPath) {
		/** @type {GeneratedRoutes} */
		const result = {};
		for (const [key, value] of Object.entries(routes)) {
			if (typeof value === 'object' && !Array.isArray(value)) {
				result[key] = handleImports(value, routesPath);
			} else if (key === 'meta' && Array.isArray(value)) {
				const varNames = value.map((metaPath) => addImport(metaPath));
				result[key] = `{ ...${varNames.toReversed().join(', ...')} }`;
			} else if (
				typeof value === 'string' &&
				(key === 'hooks' || key === 'meta' || (!allLazy && !value.endsWith('.lazy.svelte')))
			) {
				result[key] = addImport(value);
			} else {
				result[key] = `() => import('${routesPath}${value}')`;
			}
		}
		return result;
	})(routes, routesPath);

	const imports = [...importsMap].map(([key, value]) => {
		if (value.endsWith('.ts')) {
			value = value.replace('.ts', '');
		}
		return `import ${key} from '${value}';`;
	});

	const stringifiedRoutes = JSON.stringify(withImports, undefined, 2)
		.replaceAll(/"(.*)": /g, `'$1': `)
		.replaceAll(/: "(.*)"/g, ': $1');

	return [
		`import { createRouter } from 'sv-router';`,
		...imports,
		'',
		`export const routes = ${stringifiedRoutes};`,
		...(js ? [] : ['export type Routes = typeof routes;']),
		`export const { p, navigate, isActive, preload, resolveMeta, route } = createRouter(routes${
			base === undefined ? '' : `, { base: '${base}' }`
		});`,
		'',
	].join('\n');
}

/**
 * @param {string} value
 * @returns {string}
 */
export function pathToCorrectCasing(value) {
	const parts = /** @type {string[]} */ ([]);

	/**
	 * @param {RegExp} regex
	 * @param {number[]} [groups] The capture groups that make up the name.
	 */
	function extractLastPart(regex, groups = [1]) {
		if (!regex.test(value)) return;
		const exec = /** @type {RegExpExecArray} */ (regex.exec(value));
		if (exec.index > 0) {
			const before = value.slice(0, exec.index - 1);
			parts.push(...before.split(/\/|-|\./));
		}
		return groups
			.map((group) => exec[group] ?? '')
			.join('')
			.replaceAll(/[^\w-]/g, '');
	}

	const lastPart =
		extractLastPart(CATCH_ALL_FILENAME_REGEX) ||
		extractLastPart(PARAM_FILENAME_REGEX, [1, 2]) ||
		extractLastPart(HOOKS_FILENAME_REGEX) ||
		extractLastPart(META_FILENAME_REGEX) ||
		extractLastPart(FILENAME_REGEX);
	if (!lastPart) {
		throw new Error(`Invalid filename: ${value}`);
	}
	parts.push(...lastPart.split('-'));

	const uppercased = parts.map((part, index) => {
		part = part.replace(/^_+/, '');
		part = part.replace(/^[[(]+([^[\]()]+)[\])]+$/, '$1');
		part = part.replaceAll(/\W/g, '');
		if (index === 0 && (lastPart === 'hooks' || lastPart === 'meta')) return part;
		return part.charAt(0).toUpperCase() + part.slice(1);
	});
	return uppercased.join('');
}
