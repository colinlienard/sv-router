import fs from 'node:fs';
import path from 'node:path';

/** @typedef {(string | { name: string; tree: FileTree })[]} FileTree */

/**
 * @typedef {{
 * 	[key: string]: string | GeneratedRoutes;
 * }} GeneratedRoutes
 */

const PARAM_FILENAME_REGEX = /\[(.*)\].svelte/;
const HOOKS_FILENAME_REGEX = /hooks(\.svelte)?\.(js|ts)$/;

/**
 * @param {string} routesPath
 * @returns {string}
 */
export function generateRouterCode(routesPath) {
	const fileTree = buildFileTree(path.join(process.cwd(), routesPath));
	const routeMap = createRouteMap(fileTree);
	return createRouterCode(routeMap, path.join('..', routesPath));
}

/**
 * @param {string} routesPath
 * @returns {FileTree}
 */
export function buildFileTree(routesPath) {
	const entries = fs.readdirSync(routesPath);
	/** @type {FileTree} */
	const tree = [];
	for (const entry of entries) {
		const stat = fs.lstatSync(path.join(routesPath, entry));
		if (stat.isDirectory()) {
			tree.push({ name: entry, tree: buildFileTree(path.join(routesPath, entry)) });
			continue;
		}
		if (!entry.endsWith('.svelte') && !HOOKS_FILENAME_REGEX.test(entry)) {
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
				continue;
			}

			if (entry.endsWith('index.svelte')) {
				const indexEntry = entry.replace(/\.?index\.svelte/, '');
				result['/' + (indexEntry ? filePathToRoute(indexEntry) : '')] = prefix + entry;
				continue;
			}

			if (entry === 'layout.svelte') {
				result['layout'] = prefix + entry;
				continue;
			}

			// Match [...slug].svelte
			const catchAll = /\[\.\.\.(.*)\]\.svelte/.exec(entry);
			if (catchAll) {
				result['*' + catchAll[1]] = prefix + entry;
				continue;
			}

			// Match [id].svelte
			if (PARAM_FILENAME_REGEX.test(entry)) {
				result['/' + filePathToRoute(entry.replace(PARAM_FILENAME_REGEX, ':$1'))] = prefix + entry;
				continue;
			}

			result['/' + filePathToRoute(entry.replace('.svelte', ''))] = prefix + entry;
		} else {
			const entryName = filePathToRoute(entry.name);
			result['/' + entryName] = createRouteMap(entry.tree, prefix + entryName + '/');
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
 * @param {GeneratedRoutes} routes
 * @param {string} routesPath
 * @returns {string}
 */
export function createRouterCode(routes, routesPath) {
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
			} else if (key === 'hooks') {
				const variableName = hooksPathToCamelCase(value);
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
		`export const { p, navigate, isActive, route } = createRouter(${stringifiedRoutes});`,
	].join('\n');
}

/**
 * @param {string} value
 * @returns {string}
 */
export function hooksPathToCamelCase(value) {
	const parts = value.split(/\/|-/);
	parts.pop();
	parts.push('hooks');
	const uppercased = parts.map((part, index) => {
		if (index === 0) return part;
		return part.charAt(0).toUpperCase() + part.slice(1);
	});
	return uppercased.join('');
}
