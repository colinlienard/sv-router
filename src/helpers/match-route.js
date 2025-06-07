/**
 * @typedef {import('../index.d.ts').LayoutComponent} LayoutComponent
 *
 * @typedef {import('../index.d.ts').RouteComponent} RouteComponent
 *
 * @typedef {import('../index.d.ts').Hooks} Hooks
 *
 * @typedef {import('../index.d.ts').Routes} Routes
 */

/**
 * @param {string} pathname
 * @param {Routes} routes
 * @returns {{
 * 	match: RouteComponent | undefined;
 * 	layouts: LayoutComponent[];
 * 	hooks: Hooks[];
 * 	meta: Record<string, any>;
 * 	params: Record<string, string>;
 * 	breakFromLayouts: boolean;
 * }}
 */
export function matchRoute(pathname, routes) {
	// Remove trailing slash
	if (pathname.length > 1 && pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}
	const pathParts = pathname.split('/').slice(1);
	const allRoutes = sortRoutes(Object.keys(routes));

	/** @type {RouteComponent | undefined} */
	let match;

	/** @type {LayoutComponent[]} */
	let layouts = [];

	/** @type {Hooks[]} */
	let hooks = [];

	/** @type {Record<string, string>} */
	let params = {};

	/** @type {Record<string, any>} */
	let meta = {};

	let breakFromLayouts = false;

	outer: for (const route of allRoutes) {
		const routeParts = route.split('/');
		if (routeParts[0] === '') routeParts.shift();

		for (let [index, routePart] of routeParts.entries()) {
			breakFromLayouts = routePart.startsWith('(') && routePart.endsWith(')');
			if (breakFromLayouts) {
				routePart = routePart.slice(1, -1);
			}

			const pathPart = pathParts[index];
			if (routePart.startsWith(':')) {
				params[routePart.slice(1)] = pathPart;
			} else if (routePart.startsWith('*')) {
				const param = routePart.slice(1);
				if (param) {
					params[param] = pathParts.slice(index).join('/');
				}
				if (breakFromLayouts) {
					routePart = `(${routePart})`;
				} else if ('layout' in routes && routes.layout) {
					layouts.push(routes.layout);
				}
				const resolvedPath = /** @type {keyof Routes} */ (
					(index ? '/' : '') + routeParts.join('/')
				);
				match = /** @type {RouteComponent} */ (routes[resolvedPath]);
				break outer;
			} else if (routePart !== pathPart) {
				break;
			}

			if (index !== routeParts.length - 1) {
				continue;
			}

			const routeMatch = /** @type {RouteComponent} */ (
				routes[/** @type {keyof Routes} */ ('/' + routeParts.join('/'))]
			);

			if (!breakFromLayouts && 'layout' in routes && routes.layout) {
				layouts.push(routes.layout);
			}

			if ('hooks' in routes && routes.hooks) {
				hooks.push(routes.hooks);
			}

			if ('meta' in routes && routes.meta) {
				meta = { ...meta, ...routes.meta };
			}

			if (typeof routeMatch === 'function') {
				if (routeParts.length === pathParts.length) {
					match = routeMatch;
					break outer;
				}
				continue;
			}

			const nestedPathname = '/' + pathParts.slice(index + 1).join('/');
			const result = matchRoute(nestedPathname, routeMatch);
			if (result) {
				match = result.match;
				params = { ...params, ...result.params };
				hooks.push(...result.hooks);
				meta = { ...meta, ...result.meta };
				if (result.breakFromLayouts) {
					layouts = [];
				} else {
					layouts.push(...result.layouts);
				}
			}
			break outer;
		}
	}

	return { match, layouts, hooks, params, meta, breakFromLayouts };
}

/**
 * @param {string[]} routes
 * @returns {string[]}
 */
export function sortRoutes(routes) {
	return routes.toSorted((a, b) => getRoutePriority(a) - getRoutePriority(b));
}

/**
 * @param {string} route
 * @returns {number}
 */
function getRoutePriority(route) {
	if (route === '' || route === '/') return 1;
	if (route.startsWith('*')) return 4;
	if (route.includes(':')) return 3;
	return 2;
}
