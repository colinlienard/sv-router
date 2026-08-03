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

/** A segment that is only made of a param, e.g. `:username` */
const DYNAMIC_SEGMENT_REGEX = /^:[\w-]+$/;

/** Every param of a segment, e.g. `username` in `@:username` */
const PARAMS_REGEX = /:([\w-]+)/g;

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

	for (let [index, routePart] of routeParts.entries()) {
		const breakFromLayouts = routePart.startsWith('(') && routePart.endsWith(')');
		if (breakFromLayouts) {
			routePart = routePart.slice(1, -1);
		}

		const pathPart = pathParts[index];
		const isLayoutGroup = routePart === '' && typeof routes['/'] !== 'function';

		// Dynamic segment
		if (isDynamicSegment(routePart)) {
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
		// Partially dynamic segment (e.g. `@:username`)
		else if (routePart.includes(':')) {
			const segmentParams = matchPartialSegment(routePart, pathPart);
			if (!segmentParams) return null;
			Object.assign(params, segmentParams);
		}
		// Static segment mismatch
		else if (!isLayoutGroup && routePart.toLowerCase() !== pathPart?.toLowerCase()) {
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
 * Whether the segment is only made of a param, e.g. `:username`.
 *
 * @param {string} segment
 * @returns {boolean}
 */
export function isDynamicSegment(segment) {
	return DYNAMIC_SEGMENT_REGEX.test(segment);
}

/**
 * Match a route segment that mixes static text and dynamic params (e.g. `@:username`) against a
 * path segment. Returns the extracted params, or `null` if it does not match.
 *
 * @param {string} routePart
 * @param {string | undefined} pathPart
 * @returns {Record<string, string> | null}
 */
export function matchPartialSegment(routePart, pathPart) {
	if (pathPart === undefined) return null;

	/** @type {string[]} */
	const names = [];
	let pattern = '';
	let lastIndex = 0;
	for (const match of routePart.matchAll(PARAMS_REGEX)) {
		pattern += escapeRegExp(routePart.slice(lastIndex, match.index)) + '([^/]+?)';
		names.push(match[1]);
		lastIndex = match.index + match[0].length;
	}
	pattern += escapeRegExp(routePart.slice(lastIndex));

	const matched = new RegExp(`^${pattern}$`, 'i').exec(pathPart);
	if (!matched) return null;

	return Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(matched[i + 1])]));
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeRegExp(value) {
	return value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
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
	return routes.toSorted((a, b) => {
		const priorityA = getRoutePriority(a);
		const priorityB = getRoutePriority(b);
		if (priorityA === priorityB) return 0;
		return priorityA < priorityB ? -1 : 1;
	});
}

/**
 * Build a comparable priority made of one digit per segment, so that the most specific routes are
 * matched first: static < partially dynamic < dynamic < catch-all.
 *
 * @param {string} route
 * @returns {string}
 */
function getRoutePriority(route) {
	if (route === '' || route === '/') return '0';
	return route
		.split('/')
		.filter(Boolean)
		.map((segment) => {
			segment = segment.replace(/^\((.*)\)$/, '$1');
			if (segment.startsWith('*')) return '4';
			if (isDynamicSegment(segment)) return '3';
			if (segment.includes(':')) return '2';
			return '1';
		})
		.join('');
}
