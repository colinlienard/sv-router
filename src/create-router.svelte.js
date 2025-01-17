import { BROWSER, DEV } from 'esm-env';
import { matchRoute } from './helpers/match-route.js';
import { preloadOnHover } from './helpers/preload-on-hover.js';
import { constructPath, resolveRouteComponents } from './helpers/utils.js';

/** @type {import('./index.d.ts').Routes} */
export let routes;

/** @type {import('svelte').Component[]} */
export let componentTree = $state([]);

/** @type {Record<string, string>} */
export let paramsStore = $state({});

let location = $state({
	pathname: globalThis.location.pathname,
	search: globalThis.location.search,
	state: globalThis.history.state,
	hash: globalThis.location.hash,
});

/**
 * @template {import('./index.d.ts').Routes} T
 * @param {T} r
 * @returns {import('./index.d.ts').RouterMethods<T>}
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
		navigate(...args) {
			const path = constructPath(args[0], args[1]);
			globalThis.history.pushState({}, '', path);
			onNavigate();
		},
		get params() {
			return paramsStore;
		},
		get location() {
			return location;
		},
	};
}

export function onNavigate() {
	if (!routes) {
		throw new Error('Router not initialized: `createRouter` was not called.');
	}
	location = {
		pathname: globalThis.location.pathname,
		search: globalThis.location.search,
		state: globalThis.history.state,
		hash: globalThis.location.hash,
	};
	const { match, layouts, params } = matchRoute(globalThis.location.pathname, routes);
	resolveRouteComponents(match ? [...layouts, match] : layouts).then((components) => {
		Object.assign(componentTree, components);
	});
	for (const key of Object.keys(paramsStore)) delete paramsStore[key];
	Object.assign(paramsStore, params);
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
	globalThis.history.pushState({}, '', anchor.href);
	onNavigate();
}
