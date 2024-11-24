import { BROWSER, DEV } from 'esm-env';
import type { Component } from 'svelte';
import { matchRoute } from './helpers/match-route.ts';
import { resolveRouteComponents } from './helpers/utils.ts';
import type { Params, Path, Routes } from './types/types.ts';

export let routes: Routes;
export const componentTree = $state<Component[]>([]);
export const paramsStore = $state<Record<string, string>>({});

export function createRouter<T extends Routes>(r: T) {
	routes = r;

	if (DEV && BROWSER) {
		import('./helpers/validate-routes.ts').then(({ validateRoutes }) => {
			validateRoutes(routes);
		});
	}

	return {
		path(path: Path<T>) {
			return path;
		},
		goto(path: Path<T>) {
			globalThis.history.pushState({}, '', path as unknown as string);
			onNavigate();
		},
		queryParams() {
			const readonly = $derived(paramsStore);
			return readonly as Params<T>;
		},
	};
}

export function onNavigate() {
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
