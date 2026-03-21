/**
 * @typedef {import('../index.d.ts').LayoutComponent} LayoutComponent
 *
 * @typedef {import('../index.d.ts').RouteComponent} RouteComponent
 *
 * @typedef {import('../index.d.ts').Hooks} Hooks
 *
 * @typedef {import('../index.d.ts').Routes} Routes
 *
 * @typedef {import('../index.d.ts').RouteMeta} RouteMeta
 *
 * @typedef {{
 * 	match: RouteComponent | undefined;
 * 	layouts: LayoutComponent[];
 * 	hooks: Hooks[];
 * 	meta: RouteMeta;
 * 	params: Record<string, string>;
 * 	breakFromLayouts: boolean;
 * 	isCatchAll: boolean;
 * }} MatchResult
 */

/**
 * @param {string} pathname
 * @param {Routes} routes
 * @returns {MatchResult}
 */
export function matchRoute(pathname, routes) {
	if (pathname.length > 1 && pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}

	const pathParts = pathname.split('/').slice(1);
	const sortedRoutes = sortRoutes(Object.keys(routes));

	/** @type {RouteMeta} */
	let baseMeta = {};
	const rootRoute = routes['/'];
	if (rootRoute && typeof rootRoute === 'object' && 'meta' in rootRoute && rootRoute.meta) {
		baseMeta = { ...rootRoute.meta };
	}

	/** @type {MatchResult | undefined} */
	let catchAllFallback;

	for (const route of sortedRoutes) {
		const attempt = tryMatch(route, pathParts, pathname, routes, baseMeta);
		if (!attempt) continue;

		if (attempt.fallback) {
			if (!catchAllFallback) catchAllFallback = attempt.result;
			continue;
		}

		return attempt.result;
	}

	return (
		catchAllFallback || {
			match: undefined,
			layouts: [],
			hooks: [],
			params: {},
			meta: baseMeta,
			breakFromLayouts: false,
			isCatchAll: false,
		}
	);
}

/**
 * Try to match a single route key against the path. Returns null if the route doesn't match.
 *
 * @param {string} route
 * @param {string[]} pathParts
 * @param {string} pathname
 * @param {Routes} routes
 * @param {RouteMeta} baseMeta
 * @returns {{ result: MatchResult; fallback: boolean } | null}
 */
function tryMatch(route, pathParts, pathname, routes, baseMeta) {
	const routeParts = route.split('/');
	if (routeParts[0] === '') routeParts.shift();

	/** @type {Record<string, string>} */
	const params = {};
	/** @type {boolean} */
	let breakFromLayouts;

	for (let [index, routePart] of routeParts.entries()) {
		breakFromLayouts = routePart.startsWith('(') && routePart.endsWith(')');
		if (breakFromLayouts) {
			routePart = routePart.slice(1, -1);
		}

		const pathPart = pathParts[index];
		const isLayoutGroup = routePart === '' && typeof routes['/'] !== 'function';

		// Dynamic segment
		if (routePart.startsWith(':')) {
			params[routePart.slice(1)] = decodeURIComponent(pathPart);
		}
		// Catch-all segment
		else if (routePart.startsWith('*')) {
			const param = routePart.slice(1);
			if (param) {
				params[param] = pathParts.slice(index).map(decodeURIComponent).join('/');
			}
			const context = collectContext(routes, breakFromLayouts, baseMeta);
			const resolvedPath = /** @type {keyof Routes} */ ((index ? '/' : '') + routeParts.join('/'));
			return {
				result: {
					match: /** @type {RouteComponent} */ (routes[resolvedPath]),
					...context,
					params,
					breakFromLayouts,
					isCatchAll: true,
				},
				fallback: false,
			};
		}
		// Static segment mismatch
		else if (routePart.toLowerCase() !== pathPart?.toLowerCase() && !isLayoutGroup) {
			return null;
		}

		// Continue matching next segment
		if (index !== routeParts.length - 1) continue;

		// Last segment — resolve the route value
		const routeKey = /** @type {keyof Routes} */ ('/' + routeParts.join('/'));
		const routeMatch = /** @type {RouteComponent} */ (routes[routeKey]);

		if (typeof routeMatch === 'function' && routeParts.length !== pathParts.length) {
			return null;
		}

		const context = collectContext(routes, breakFromLayouts, baseMeta);

		// Leaf route (component function)
		if (typeof routeMatch === 'function') {
			if (routeParts.length !== pathParts.length) return null;
			return {
				result: { match: routeMatch, ...context, params, breakFromLayouts, isCatchAll: false },
				fallback: false,
			};
		}

		// Nested routes — recurse
		const nestedPathname = isLayoutGroup ? pathname : '/' + pathParts.slice(index + 1).join('/');
		const nested = matchRoute(nestedPathname, routeMatch);
		if (!nested.match) return null;

		return {
			result: mergeWithNested(context, nested, params, breakFromLayouts),
			fallback: isLayoutGroup && nested.isCatchAll,
		};
	}

	return null;
}

/**
 * Collect layouts, hooks, and meta from the current route level.
 *
 * @param {Routes} routes
 * @param {boolean} breakFromLayouts
 * @param {RouteMeta} baseMeta
 * @returns {{ layouts: LayoutComponent[]; hooks: Hooks[]; meta: RouteMeta }}
 */
function collectContext(routes, breakFromLayouts, baseMeta) {
	/** @type {LayoutComponent[]} */
	const layouts = [];
	/** @type {Hooks[]} */
	const hooks = [];
	let meta = { ...baseMeta };

	if (!breakFromLayouts && 'layout' in routes && routes.layout) {
		layouts.push(routes.layout);
	}
	if ('hooks' in routes && routes.hooks) {
		hooks.push(routes.hooks);
	}
	if ('meta' in routes && routes.meta) {
		meta = { ...meta, ...routes.meta };
	}

	return { layouts, hooks, meta };
}

/**
 * Merge current level context with a nested match result.
 *
 * @param {{ layouts: LayoutComponent[]; hooks: Hooks[]; meta: RouteMeta }} context
 * @param {MatchResult} nested
 * @param {Record<string, string>} params
 * @param {boolean} breakFromLayouts
 * @returns {MatchResult}
 */
function mergeWithNested(context, nested, params, breakFromLayouts) {
	const shouldBreak = nested.breakFromLayouts;
	return {
		match: nested.match,
		layouts: shouldBreak ? [] : [...context.layouts, ...nested.layouts],
		hooks: [...context.hooks, ...nested.hooks],
		params: { ...params, ...nested.params },
		meta: { ...context.meta, ...nested.meta },
		breakFromLayouts: shouldBreak || breakFromLayouts,
		isCatchAll: nested.isCatchAll,
	};
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
	if (route.includes('*')) return 4;
	if (route.includes(':')) return 3;
	return 2;
}
