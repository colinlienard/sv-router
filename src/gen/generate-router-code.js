import fs from 'node:fs';
import path from 'node:path';

/** @typedef {(string | { name: string; tree: FileTree })[]} FileTree */

/**
 * @typedef {{
 * 	[key: string]: string | GeneratedRoutes;
 * }} GeneratedRoutes
 */

const PARAM_FILENAME_REGEX = /\[(.*)\].svelte/g;

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
		if (!entry.endsWith('.svelte')) continue;
		handleFlatFilename(tree, entry);
	}
	return tree;
}

/**
 * @param {FileTree} tree
 * @param {string} path
 */
function handleFlatFilename(tree, path) {
	// Split the path by the first dot that is not preceded or followed by another dot
	const splited = path.split(/(?<!\.)\.(?!\.)/);
	if (splited.length === 2) {
		tree.push(path);
		return;
	}
	const first = /** @type {string} */ (splited.shift());
	for (const item of tree) {
		if (typeof item === 'object' && item.name === first) {
			handleFlatFilename(item.tree, splited.join('.'));
			return;
		}
	}
	/** @type {FileTree} */
	const branch = [];
	handleFlatFilename(branch, splited.join('.'));
	tree.push({ name: first, tree: branch });
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
			const catchAll = /\[\.\.\.(.*)\]\.svelte/g.exec(entry); // Match [...slug].svelte
			switch (true) {
				case entry === 'index.svelte': {
					result['/'] = prefix + entry;
					break;
				}
				case entry === 'layout.svelte': {
					result['layout'] = prefix + entry;
					break;
				}
				case !!catchAll: {
					result['*' + catchAll[1]] = prefix + entry;
					break;
				}
				default: {
					if (PARAM_FILENAME_REGEX.test(entry)) {
						result['/' + entry.replaceAll(PARAM_FILENAME_REGEX, ':$1')] = prefix + entry;
						break;
					}
					result['/' + entry.replace('.svelte', '')] = prefix + entry;
					break;
				}
			}
		} else {
			result['/' + entry.name] = createRouteMap(entry.tree, prefix + entry.name + '/');
		}
	}
	return result;
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

	const jsonRoutes = JSON.stringify(routes, undefined, 2);
	const withImports = jsonRoutes.replaceAll(
		/"(.*)": "(.*)",?/g,
		`"$1": () => import("${routesPath}$2"),`,
	);
	return [
		'import { createRouter } from "sv-router";',
		'\n\n',
		`export const { p, navigate, isActive, route } = createRouter(${withImports});`,
	].join('');
}
