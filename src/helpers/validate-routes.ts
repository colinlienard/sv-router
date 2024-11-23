import type { Routes } from '../types.ts';

export function validateRoutes(routes: Routes) {
	const paths = getRoutePaths(routes);
	const wildcardPaths = paths.filter((path) => path.endsWith('*'));
	for (const wildcardPath of wildcardPaths) {
		const parentPath = wildcardPath.slice(0, -1);
		const dynamicPath = paths.find(
			(p) =>
				p !== '/' &&
				!p.endsWith('*') &&
				p.startsWith(parentPath === '' ? '/:' : parentPath) &&
				p.match(/:[^/]*$/g), // Match dynamic paths without slashes after the colon
		);
		if (dynamicPath) {
			console.warn(
				`Router warning: Wildcard route \`${wildcardPath}\` should not be at the same level as dynamic route \`${dynamicPath}\`.`,
			);
		}
	}
}

export function getRoutePaths(routes: Routes): string[] {
	const paths: string[] = [];
	for (const [key, value] of Object.entries(routes)) {
		if (typeof value === 'object') {
			paths.push(
				...getRoutePaths(value).map((path) => {
					if (path === '*') {
						return key + '/*';
					}
					if (path === '/') {
						return key;
					}
					return key + path;
				}),
			);
		} else {
			paths.push(key);
		}
	}
	return paths;
}
