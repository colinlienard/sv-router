import { isDynamicSegment } from './match-route.js';

/** @param {import('../index.d.ts').Routes} routes */
export function validateRoutes(routes) {
	const paths = getRoutePaths(routes);
	const wildcardPaths = paths.filter((path) => path.endsWith('*'));
	for (const wildcardPath of wildcardPaths) {
		const parentPath = wildcardPath.slice(0, -1);
		const dynamicPath = paths.find(
			(p) =>
				p !== '/' &&
				!p.endsWith('*') &&
				p.startsWith(parentPath === '' ? '/:' : parentPath) &&
				isLastSegmentDynamic(p),
		);
		if (dynamicPath) {
			console.warn(
				`Router warning: Wildcard route \`${wildcardPath}\` should not be at the same level as dynamic route \`${dynamicPath}\`.`,
			);
		}
	}
}

/**
 * @param {string} path
 * @returns {boolean}
 */
function isLastSegmentDynamic(path) {
	const lastSegment = path.slice(path.lastIndexOf('/') + 1).replace(/^\((.*)\)$/, '$1');
	return isDynamicSegment(lastSegment);
}

/**
 * @param {import('../index.d.ts').Routes} routes
 * @returns {string[]}
 */
export function getRoutePaths(routes) {
	const paths = [];
	for (const [key, value] of Object.entries(routes)) {
		if (['layout', 'hooks', 'meta'].includes(key)) {
			continue;
		}
		if (typeof value === 'object') {
			paths.push(
				...getRoutePaths(/** @type {import('../index.d.ts').Routes} */ (value)).map((path) => {
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
