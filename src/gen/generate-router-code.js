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
			const catchAll = /\[\.\.\.(.*)\]\.svelte/g.exec(entry);
			if (catchAll) {
				result['*' + catchAll[1]] = prefix + entry;
				continue;
			}

			// Match [id].svelte
			if (PARAM_FILENAME_REGEX.test(entry)) {
				result['/' + filePathToRoute(entry.replaceAll(PARAM_FILENAME_REGEX, ':$1'))] =
					prefix + entry;
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
