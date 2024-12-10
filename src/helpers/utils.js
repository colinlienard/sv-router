/**
 * @param {string} path
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
export function constructPath(path, params) {
	if (!params) return path;

	let result = path;
	for (const key in params) {
		result = result.replace(`:${key}`, params[key]);
	}
	return result;
}

/**
 * @param {import('../index.d.ts').RouteComponent[]} input
 * @returns {Promise<import('svelte').Component[]>}
 */
export function resolveRouteComponents(input) {
	return Promise.all(input.map((c) => resolveRouteComponent(c)));
}

/**
 * @param {import('../index.d.ts').RouteComponent} input
 * @returns {Promise<import('svelte').Component>}
 */
export function resolveRouteComponent(input) {
	return new Promise((resolve) => {
		if (isLazyImport(input)) {
			Promise.resolve(input()).then((module) => {
				resolve(module.default);
			});
		} else {
			resolve(input);
		}
	});
}

/**
 * @param {unknown} input
 * @returns {input is import('../index.d.ts').LazyRouteComponent}
 */
export function isLazyImport(input) {
	return typeof input === 'function' && !!/\(\)\s?=>\s?import\(.*\)/g.test(String(input));
}
