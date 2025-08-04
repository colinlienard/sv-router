import { BROWSER, DEV } from 'esm-env';
import { isActive } from './helpers/is-active.js';
import { matchRoute } from './helpers/match-route.js';
import { preload, preloadOnHover } from './helpers/preload.js';
import {
	constructPath,
	join,
	resolveRouteComponents,
	stripBase,
	updatedLocation,
} from './helpers/utils.js';
import { syncSearchParams } from './search-params.svelte.js';

/** @type {import('./index.d.ts').Routes} */
let routes;

/** @type {{ name?: string }} */
export const base = {
	name: undefined,
};

/** @type {{ value: import('svelte').Component[] }} */
export let componentTree = $state({ value: [] });

/** @type {{ value: Record<string, string> }} */
export let params = $state({ value: {} });

export let location = $state(updatedLocation());

let meta = $state({ value: {} });

let navigationIndex = 0;
let pendingNavigationIndex = 0;

/** @param {string | undefined} basename */
export function init(basename) {
	if (basename) {
		const url = new URL(globalThis.location.toString());
		if (basename === '#') {
			base.name = '#';
			if (!globalThis.location.href.includes('#')) {
				url.hash = '/';
				history.replaceState(history.state || {}, '', url.toString());
			}
		} else {
			base.name = (basename.startsWith('/') ? '' : '/') + basename;
			if (!url.pathname.startsWith(base.name)) {
				url.pathname = join(base.name, url.pathname);
				history.replaceState(history.state || {}, '', url.toString());
			}
		}
	}
	Object.assign(location, updatedLocation());
}

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
				return /** @type {import('./index.d.ts').Path<T>} */ (stripBase(location.pathname));
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

	path = constructPath(path, options.params);
	if (options.search && !options.search.startsWith('?')) {
		options.search = '?' + options.search;
	}
	if (options.hash && !options.hash.startsWith('#') && base.name !== '#') {
		options.hash = '#' + options.hash;
	}
	if (base.name === '#') {
		path = new URL(path).hash;
	}
	onNavigate(path, options);
}

/** @param {string} [path] */
function getMatchPath(path) {
	let matchPath = '';

	if (path) {
		matchPath = path;
	} else if (base.name === '#') {
		matchPath = globalThis.location.hash.slice(1);
	} else {
		matchPath = globalThis.location.pathname;
	}

	if (base.name && matchPath.startsWith(base.name)) {
		matchPath = matchPath.slice(base.name.length) || '/';
	}

	return stripBase(matchPath);
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

	let matchPath = getMatchPath(path);
	const { match, layouts, hooks, meta: newMeta, params: newParams } = matchRoute(matchPath, routes);

	for (const { beforeLoad } of hooks) {
		try {
			pendingNavigationIndex = currentNavigationIndex;
			await beforeLoad?.({ pathname: matchPath, meta: newMeta, ...options });
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
		let url = new URL(globalThis.location.toString());
		url.search = '';
		if (options.search) url.search = options.search;
		if (base.name === '#') {
			url.hash = path;
		} else {
			if (options.hash) path += options.hash;
			url.pathname = base.name ? join(base.name, path) : path;
		}
		const historyMethod = options.replace ? 'replaceState' : 'pushState';
		globalThis.history[historyMethod](options.state || {}, '', url.toString());
		syncSearchParams(options.search);
	} else {
		syncSearchParams(globalThis.location.search);
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
	Object.assign(location, updatedLocation());

	if (options.scrollToTop !== false) {
		window.scrollTo({ top: 0, left: 0, behavior: options.scrollToTop });
	}

	for (const { afterLoad } of hooks) {
		void afterLoad?.({ pathname: matchPath, meta: newMeta, ...options });
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

	const path = base.name === '#' ? url.hash : url.pathname;
	const hash = base.name === '#' ? undefined : url.hash;

	event.preventDefault();
	const { replace, state, scrollToTop, viewTransition } = anchor.dataset;
	onNavigate(path, {
		replace: replace === '' || replace === 'true',
		search: url.search,
		state,
		hash,
		scrollToTop: scrollToTop === 'false' ? false : /** @type ScrollBehavior */ (scrollToTop),
		viewTransition: viewTransition === '' || viewTransition === 'true',
	});
}
