/**
 * @typedef {import('../index.d.ts').LayoutComponent} LayoutComponent
 *
 * @typedef {import('../index.d.ts').RouteComponent} RouteComponent
 *
 * @typedef {import('../index.d.ts').Routes} Routes
 */

/**
 * @param {string} pathname
 * @param {Routes} routes
 * @returns {{
 * 	match: RouteComponent | undefined;
 * 	layouts: LayoutComponent[];
 * 	params: Record<string, string>;
 * 	breakFromLayouts: boolean;
 * }}
 */
export function matchRoute(pathname, routes) {
	// Remove trailing slash
	if (pathname.length > 1 && pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}
	const pathParts = pathname.split('/');
	const allRouteParts = sortRoutes(Object.keys(routes)).map((route) => route.split('/'));

	/** @type {RouteComponent | undefined} */
	let match;

	/** @type {LayoutComponent[]} */
	let layouts = [];

	/** @type {Record<string, string>} */
	let params = {};

	let breakFromLayouts = false;

	outer: for (const routeParts of allRouteParts) {
		for (let [index, routePart] of sortRoutes(routeParts).entries()) {
			breakFromLayouts = routePart.startsWith('(') && routePart.endsWith(')');
			if (breakFromLayouts) {
				routePart = routePart.slice(1, -1);
			}

			const pathPart = pathParts[index];
			if (routePart.startsWith(':')) {
				params[routePart.slice(1)] = pathPart;
			} else if (routePart === '*') {
				match = /** @type {RouteComponent} */ (
					routes[/** @type {keyof Routes} */ (routeParts.join('/'))]
				);
				break outer;
			} else if (routePart !== pathPart) {
				break;
			}

			if (index !== routeParts.length - 1) {
				continue;
			}

			if (!breakFromLayouts && 'layout' in routes && routes.layout) {
				layouts.push(routes.layout);
			}

			const routeMatch = /** @type {RouteComponent} */ (
				routes[/** @type {keyof Routes} */ (routeParts.join('/'))]
			);

			if (typeof routeMatch === 'function') {
				if (routeParts.length === pathParts.length) {
					match = routeMatch;
				} else {
					continue;
				}
			} else if (routeMatch) {
				const nestedPathname = '/' + pathParts.slice(index + 1).join('/');
				const result = matchRoute(nestedPathname, routeMatch);
				if (result) {
					match = result.match;
					params = { ...params, ...result.params };
					if (result.breakFromLayouts) {
						layouts = [];
					} else {
						layouts.push(...result.layouts);
					}
				}
			}
			break outer;
		}
	}

	return { match, layouts, params, breakFromLayouts };
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
	if (route === '*') return 4;
	if (route.includes(':')) return 3;
	return 2;
}
