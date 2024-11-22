import type { Routes } from '../types.ts';

export function validateRoutes(routes: Routes) {
	const paths = getRoutePaths(routes);
	const wildcardPaths = paths.filter((path) => path.endsWith('*'));
	for (const wildcardPath of wildcardPaths) {
		const index = paths.indexOf(wildcardPath);
		const parentPath = wildcardPath.slice(0, -1);
		const parentPathIndex = paths.findIndex(
			(p) => p !== '/' && p.startsWith(parentPath) && !p.endsWith('*'),
		);
		if (parentPathIndex !== -1 && parentPathIndex > index) {
			console.warn(
				`Router warning at \`${wildcardPath}\`: Wildcard route should be placed at the end of the object.`,
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
