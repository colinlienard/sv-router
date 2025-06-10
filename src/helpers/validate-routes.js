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
				p.match(/:[^/]*$/g), // Match dynamic paths without slashes after the colon
		);
		if (dynamicPath) {
			console.warn(
				`Router warning: Wildcard route \`${wildcardPath}\` should not be at the same level as dynamic route \`${dynamicPath}\`.`,
			);
		}
	}
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
