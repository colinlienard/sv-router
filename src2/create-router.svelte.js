import { BROWSER, DEV } from 'esm-env';
import { matchRoute } from './helpers/match-route.js';
import { constructPath, resolveRouteComponents } from './helpers/utils.js';

/**
 * @typedef {import('./index.d.ts').Routes} Routes
 * @typedef {import('svelte').Component} Component
 */
/**
 * @template {Routes} T
 * @typedef {import('./index.d.ts').RouterMethods<T>} RouterMethods
 */

/** @type {Routes} */
export let routes;
/** @type {Component[]} */
export const componentTree = $state([]);
/** @type {Record<string, string>} */
export const paramsStore = $state({});

/**
 * @template {Routes} T
 * @param {T} r
 * @returns {RouterMethods<T>}
 */
export function createRouter(r) {
	routes = r;

	if (DEV && BROWSER) {
		import('./helpers/validate-routes.js').then(({ validateRoutes }) => {
			validateRoutes(routes);
		});
	}

	return {
		path: constructPath,
		goto(...args) {
			const path = constructPath(args[0], args[1]);
			globalThis.history.pushState({}, '', path);
			onNavigate();
		},
		params() {
			const readonly = $derived(paramsStore);
			return readonly;
		},
	};
}

export function onNavigate() {
	if (!routes) {
		throw new Error('Router not initialized: `createRouter` was not called.');
	}
	const { match, layouts, params } = matchRoute(globalThis.location.pathname, routes);
	resolveRouteComponents(match ? [...layouts, match] : layouts).then((components) => {
		Object.assign(componentTree, components);
	});
	Object.assign(paramsStore, params);
}

/**
 * @param {Event} event
 */
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
