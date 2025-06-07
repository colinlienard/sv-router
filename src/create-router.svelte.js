import { BROWSER, DEV } from 'esm-env';
import { isActive } from './helpers/is-active.js';
import { matchRoute } from './helpers/match-route.js';
import { preload, preloadOnHover } from './helpers/preload.js';
import { constructPath, join, resolveRouteComponents } from './helpers/utils.js';
import { syncSearchParams } from './search-params.svelte.js';

/** @type {import('./index.d.ts').Routes} */
let routes;

/** @type {{ value: import('svelte').Component[] }} */
export let componentTree = $state({ value: [] });

/** @type {{ value: Record<string, string> }} */
export let params = $state({ value: {} });

export let location = $state(updatedLocation());

let meta = $state({ value: {} });

let navigationIndex = 0;
let pendingNavigationIndex = 0;

/** @type {{ name?: string }} */
export const base = {
	name: undefined,
};

/**
 * @template {import('./index.d.ts').Routes} T
 * @param {T} r
 * @returns {import('./index.d.ts').RouterApi<T>}
 */
export function createRouter(r) {
	routes = r;

	if (DEV && BROWSER) {
		import('./helpers/validate-routes.js').then(({ validateRoutes }) => {
			validateRoutes(routes);
		});
	}

	preloadOnHover(routes);

	return {
		p: constructPath,
		navigate,
		isActive,
		async preload(pathname) {
			await preload(routes, pathname);
		},
		route: {
			get params() {
				return params.value;
			},
			getParams(pathname) {
				if (!isActive(pathname)) {
					throw new Error(`\`${pathname}\` does not match the current route`);
				}
				return params.value;
			},
			get pathname() {
				return /** @type {import('./index.d.ts').Path<T>} */ (location.pathname);
			},
			get search() {
				return location.search;
			},
			get state() {
				return location.state;
			},
			get hash() {
				return location.hash;
			},
			get meta() {
				return meta.value;
			},
		},
	};
}

/**
 * @param {string | number} path
 * @param {import('./index.d.ts').NavigateOptions & { params?: Record<string, string> }} options
 */
function navigate(path, options = {}) {
	if (typeof path === 'number') {
		globalThis.history.go(path);
		return;
	}
	if (options.params) {
		path = constructPath(path, options.params);
	}
	if (options.search && !options.search.startsWith('?')) {
		options.search = '?' + options.search;
	}
	if (options.hash && !options.hash.startsWith('#')) {
		options.hash = '#' + options.hash;
	}
	onNavigate(path, options);
}

/**
 * @param {string} [path]
 * @param {import('./index.d.ts').NavigateOptions} options
 */
export async function onNavigate(path, options = {}) {
	if (!routes) {
		throw new Error('Router not initialized: `createRouter` was not called.');
	}

	navigationIndex++;
	const currentNavigationIndex = navigationIndex;

	let matchPath = path || globalThis.location.pathname;
	if (base.name && matchPath.startsWith(base.name)) {
		matchPath = matchPath.slice(base.name.length) || '/';
	}
	const { match, layouts, hooks, meta: newMeta, params: newParams } = matchRoute(matchPath, routes);

	for (const { beforeLoad } of hooks) {
		try {
			pendingNavigationIndex = currentNavigationIndex;
			await beforeLoad?.();
		} catch {
			return;
		}
	}

	const fromBeforeLoadHook = new Error().stack?.includes('beforeLoad');

	const routeComponents = await resolveRouteComponents(match ? [...layouts, match] : layouts);
	if (
		navigationIndex !== currentNavigationIndex ||
		(fromBeforeLoadHook && pendingNavigationIndex + 1 !== currentNavigationIndex)
	) {
		return;
	}

	if (path) {
		if (options.search) path += options.search;
		if (options.hash) path += options.hash;
		const historyMethod = options.replace ? 'replaceState' : 'pushState';
		const to = base.name ? join(base.name, path) : path;
		globalThis.history[historyMethod](options.state || {}, '', to);
	}

	if (options.viewTransition && document.startViewTransition !== undefined) {
		document.startViewTransition(() => {
			componentTree.value = routeComponents;
		});
	} else {
		componentTree.value = routeComponents;
	}
	params.value = newParams;
	meta.value = newMeta;
	syncSearchParams();
	Object.assign(location, updatedLocation());

	if (options.scrollToTop !== false) {
		window.scrollTo({ top: 0, left: 0, behavior: options.scrollToTop });
	}

	for (const { afterLoad } of hooks) {
		afterLoad?.();
	}
}

/** @param {Event} event */
export function onGlobalClick(event) {
	const anchor = /** @type {HTMLElement} */ (event.target).closest('a');
	if (!anchor) return;

	if (anchor.hasAttribute('target') || anchor.hasAttribute('download')) return;

	const url = new URL(anchor.href);
	const currentOrigin = globalThis.location.origin;
	if (url.origin !== currentOrigin) return;

	event.preventDefault();
	const { replace, state, scrollToTop, viewTransition } = anchor.dataset;
	onNavigate(url.pathname, {
		replace: replace === '' || replace === 'true',
		search: url.search,
		state,
		hash: url.hash,
		scrollToTop: scrollToTop === 'false' ? false : /** @type ScrollBehavior */ (scrollToTop),
		viewTransition: viewTransition === '' || viewTransition === 'true',
	});
}

function updatedLocation() {
	return {
		pathname: globalThis.location.pathname,
		search: globalThis.location.search,
		state: history.state,
		hash: globalThis.location.hash,
	};
}
