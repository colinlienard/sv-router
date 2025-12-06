import fs from 'node:fs';
import path from 'node:path';

/** @typedef {(string | { name: string; tree: FileTree })[]} FileTree */

/**
 * @typedef {{
 * 	[key: string]: string | GeneratedRoutes;
 * }} GeneratedRoutes
 */

const FILENAME_REGEX = /(?<=[/.]|^)\(?([\w-]+)\)?(\.lazy)?\.svelte$/; // any.svelte, any.lazy.svelte, (any).svelte
const PARAM_FILENAME_REGEX = /(?<=[/.]|^)\(?\[([\w-]+)\]\)?(\.lazy)?\.svelte$/; // [any].svelte, [any].lazy.svelte, ([any]).svelte
const CATCH_ALL_FILENAME_REGEX = /(?<=[/.]|^)\(?\[\.\.\.([\w-]+)\]\)?(\.lazy)?\.svelte$/; // [...any].svelte, [...any].lazy.svelte, ([...any]).svelte
const OUT_OF_LAYOUT_FILENAME_REGEX = /(?<=[/.]|^)\(\[\.?\.?\.?([\w-]+)\]\)(\.lazy)?\.svelte$/; // ([any]).svelte, ([...any]).lazy.svelte
const HOOKS_FILENAME_REGEX = /(?<=[/.]|^)(hooks)(\.svelte)?\.(js|ts)$/; // hooks.js, hooks.svelte.js, hooks.ts, hooks.svelte.ts
const META_FILENAME_REGEX = /(?<=[/.]|^)(meta)(\.svelte)?\.(js|ts)$/; // meta.js, meta.svelte.js, meta.ts, meta.svelte.ts

/**
 * @param {string} routesPath
 * @param {{ allLazy?: boolean; js?: boolean; ignore?: RegExp[] }} [options]
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

			if (entry.endsWith('index.svelte') || entry.endsWith('index.lazy.svelte')) {
				const indexEntry = entry.replace(/\.?index(\.lazy)?\.svelte/, '');
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
				const replacement = OUT_OF_LAYOUT_FILENAME_REGEX.test(entry) ? '(:$1)' : ':$1';
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
				const paramFolder = entryName.replace(/^\[(.*)\]$/, ':$1');
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

	for (const [key, val] of Object.entries(childMap)) {
		if (key === 'layout' || key === 'hooks' || key === 'meta') {
			continue;
		}

		const childMeta = typeof val === 'object' && 'meta' in val ? val.meta : meta;

		/** @type {GeneratedRoutes} */
		let routeWithGroupFiles = {};
		if (typeof val === 'string') {
			routeWithGroupFiles = { '/': val };
		} else {
			routeWithGroupFiles = { ...val };
		}
		if (layout) routeWithGroupFiles.layout = layout;
		if (hooks) routeWithGroupFiles.hooks = hooks;
		if (childMeta) routeWithGroupFiles.meta = childMeta;
		if (result[key]) {
			throw new Error(`Route conflict at \`${key}\``);
		}

		result[key] = routeWithGroupFiles;
	}
}

/**
 * @param {GeneratedRoutes} routes
 * @param {string} routesPath
 * @param {{ allLazy?: boolean; js?: boolean }} [options]
 * @returns {string}
 */
export function createRouterCode(routes, routesPath, { allLazy = false, js = false } = {}) {
	if (!routesPath.endsWith('/')) {
		routesPath += '/';
	}

	/** @type {Map<string, string>} */
	const importsMap = new Map();

	const withImports = (function handleImports(routes, routesPath) {
		/** @type {GeneratedRoutes} */
		const result = {};
		for (const [key, value] of Object.entries(routes)) {
			if (typeof value === 'object') {
				result[key] = handleImports(value, routesPath);
			} else if (
				key === 'hooks' ||
				key === 'meta' ||
				(!value.endsWith('.lazy.svelte') && !allLazy)
			) {
				const variableName = pathToCorrectCasing(value);
				importsMap.set(variableName, routesPath + value);
				result[key] = variableName;
			} else {
				result[key] = `() => import('${routesPath}${value}')`;
			}
		}
		return result;
	})(routes, routesPath);

	const imports = [...importsMap.entries()].map(([key, value]) => {
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
		'export const { p, navigate, isActive, preload, route } = createRouter(routes);',
		'',
	].join('\n');
}

/**
 * @param {string} value
 * @returns {string}
 */
export function pathToCorrectCasing(value) {
	const parts = /** @type {string[]} */ ([]);

	/** @param {RegExp} regex */
	function extractLastPart(regex) {
		if (!regex.test(value)) return;
		const exec = /** @type {RegExpExecArray} */ (regex.exec(value));
		if (exec.index > 0) {
			const before = value.slice(0, exec.index - 1);
			parts.push(...before.split(/\/|-|\./));
		}
		return exec[1];
	}

	const lastPart =
		extractLastPart(CATCH_ALL_FILENAME_REGEX) ||
		extractLastPart(PARAM_FILENAME_REGEX) ||
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
		if (index === 0 && (lastPart === 'hooks' || lastPart === 'meta')) return part;
		return part.charAt(0).toUpperCase() + part.slice(1);
	});
	return uppercased.join('');
}
