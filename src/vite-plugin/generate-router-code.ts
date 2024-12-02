import fs from 'node:fs';
import path from 'node:path';

type FileTree = (string | { name: string; tree: FileTree })[];

type GeneratedRoutes = {
	[key: string]: string | GeneratedRoutes;
};

const PARAM_FILENAME_REGEX = /\[(.*)\].svelte/g;

export function generateRouterCode(routesPath: string) {
	const fileTree = buildFileTree(path.join(process.cwd(), routesPath));
	const routeMap = createRouteMap(fileTree);
	return createRouterCode(routeMap, path.join('..', routesPath));
}

export function buildFileTree(routesPath: string): FileTree {
	const entries = fs.readdirSync(routesPath);
	const result: FileTree = [];
	for (const entry of entries) {
		const stat = fs.lstatSync(path.join(routesPath, entry));
		if (stat.isDirectory()) {
			result.push({ name: entry, tree: buildFileTree(path.join(routesPath, entry)) });
		} else {
			result.push(entry);
		}
	}
	return result;
}

export function createRouteMap(fileTree: FileTree, prefix = ''): GeneratedRoutes {
	const result: GeneratedRoutes = {};
	for (const entry of fileTree) {
		if (typeof entry === 'string') {
			switch (entry) {
				case 'index.svelte': {
					result['/'] = prefix + entry;
					break;
				}
				case '*.svelte': {
					result['*'] = prefix + entry;
					break;
				}
				case '_layout.svelte': {
					result['layout'] = prefix + entry;
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

export function createRouterCode(routes: GeneratedRoutes, routesPath: string) {
	const jsonRoutes = JSON.stringify(routes, undefined, 2);
	const withImports = jsonRoutes.replaceAll(
		/"(.*)": "(.*)",?/g,
		`"$1": () => import("${routesPath}$2"),`,
	);
	return [
		'import { createRouter } from "sv-router";',
		'\n\n',
		`export const { path, goto, params } = createRouter(${withImports});`,
	].join('');
}
