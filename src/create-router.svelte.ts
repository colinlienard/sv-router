import { BROWSER, DEV } from 'esm-env';
import type { Component } from 'svelte';
import { matchRoute } from './helpers/match-route.ts';
import { constructPath, resolveRouteComponents } from './helpers/utils.ts';
import type { AllParams, RouterMethods, Routes } from './types/types.ts';

export let routes: Routes;
export const componentTree = $state<Component[]>([]);
export const paramsStore = $state<Record<string, string>>({});

export function createRouter<T extends Routes>(r: T): RouterMethods<T> {
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
			return readonly as AllParams<T>;
		},
	};
}

export function onNavigate() {
	if (!routes) {
		throw new Error('Router not initialized. Use createRouter() to initialize the router.');
	}
	const { match, layouts, params } = matchRoute(globalThis.location.pathname, routes);
	resolveRouteComponents(match ? [...layouts, match] : layouts).then((components) => {
		Object.assign(componentTree, components);
	});
	Object.assign(paramsStore, params);
}

export function onGlobalClick(event: Event) {
	const anchor = (event.target as HTMLElement).closest('a');
	if (!anchor) return;

	if (anchor.hasAttribute('target') || anchor.hasAttribute('download')) return;

	const url = new URL(anchor.href);
	const currentOrigin = globalThis.location.origin;
	if (url.origin !== currentOrigin) return;

	event.preventDefault();
	globalThis.history.pushState({}, '', anchor.href);
	onNavigate();
}
