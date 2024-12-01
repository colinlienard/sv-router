type FileTree = (string | { name: string; tree: FileTree })[];

type Result = {
	[key: string]: string | Result;
};

export function generateRoutes(fileTree: FileTree, prefix = ''): Result {
	const result: Result = {};
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
				default: {
					result['/' + entry.replace('.svelte', '')] = prefix + entry;
					break;
				}
			}
		} else {
			result['/' + entry.name] = generateRoutes(entry.tree, prefix + entry.name + '/');
		}
	}
	return result;
}

export function generateRouter(fileTree: FileTree, path: string) {
	const routes = generateRoutes(fileTree);
	const ok = JSON.stringify(routes, undefined, 2);
	const withImports = ok.replaceAll(/"(.*)": "(.*)",?/g, `"$1": () => import("${path}$2"),`);
	return [
		'import { createRouter } from "sv-router";',
		'\n\n',
		`export const { path, goto, params } = createRouter(${withImports});`,
	].join('');
}
