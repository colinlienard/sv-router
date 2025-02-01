import { BROWSER, DEV } from 'esm-env';
import { isActive } from './helpers/is-active.js';
import { matchRoute } from './helpers/match-route.js';
import { preloadOnHover } from './helpers/preload-on-hover.js';
import { constructPath, resolveRouteComponents } from './helpers/utils.js';
import { syncSearchParams } from './search-params.svelte.js';

/** @type {import('./index.d.ts').Routes} */
export let routes;

/** @type {{ value: import('svelte').Component[] }} */
export let componentTree = $state({ value: [] });

/** @type {{ value: Record<string, string> }} */
export let params = $state({ value: {} });

export let location = $state(updatedLocation());

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
		route: {
			get params() {
				return params.value;
			},
			get pathname() {
				return location.pathname;
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
		},
	};
}

/**
 * @param {string} path
 * @param {import('./index.d.ts').NavigateOptions & { params?: Record<string, string> }} options
 */
function navigate(path, options = {}) {
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
navigate.back = () => globalThis.history.back();
navigate.forward = () => globalThis.history.forward();

/**
 * @param {string} [path]
 * @param {import('./index.d.ts').NavigateOptions} options
 */
export async function onNavigate(path, options = {}) {
	if (!routes) {
		throw new Error('Router not initialized: `createRouter` was not called.');
	}
	const {
		match,
		layouts,
		hooks,
		params: newParams,
	} = matchRoute(path || globalThis.location.pathname, routes);

	for (const { beforeLoad } of hooks) {
		try {
			await beforeLoad?.();
		} catch {
			return;
		}
	}

	componentTree.value = await resolveRouteComponents(match ? [...layouts, match] : layouts);
	params.value = newParams || {};

	if (path) {
		if (options.search) path += options.search;
		if (options.hash) path += options.hash;
		const historyMethod = options.replace ? 'replaceState' : 'pushState';
		globalThis.history[historyMethod](options.state || {}, '', path);
	}

	syncSearchParams();
	Object.assign(location, updatedLocation());

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
	const { replace, state } = anchor.dataset;
	onNavigate(url.pathname, {
		replace: replace === '' || replace === 'true',
		search: url.search,
		state,
		hash: url.hash,
	});
}

function updatedLocation() {
	return {
		pathname: globalThis.location.pathname,
		search: globalThis.location.search,
		state: globalThis.history.state,
		hash: globalThis.location.hash,
	};
}
