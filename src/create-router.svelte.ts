import { type Component } from 'svelte';
import { matchRoute } from './helpers/match-route';
import type { Routes } from './types';

let routes: Routes;
let routeComponent = $state<Component>();
let layoutComponents = $state<Component[]>([]);
let paramsStore = $state({});

export function createRouter(r: Routes) {
	routes = r;

	if (import.meta.env.DEV) {
		import('./helpers/validate-routes').then(({ validateRoutes }) => {
			validateRoutes(routes);
		});
	}

	return {
		get component() {
			return routeComponent; // TODO: implement layouts
		},
		typedPathFn(path: string) {
			return path;
		},
		queryParams() {
			const readonly = $derived(paramsStore);
			return readonly;
		},
		setup() {
			$effect(() => {
				onNavigate();

				globalThis.addEventListener('popstate', onNavigate);
				globalThis.addEventListener('click', onClick);

				return () => {
					globalThis.removeEventListener('popstate', onNavigate);
					globalThis.removeEventListener('click', onClick);
				};
			});
		},
	};
}

function onNavigate() {
	const { match, layouts, params } = matchRoute(globalThis.location.pathname, routes);
	if (match) {
		routeComponent = match;
		layoutComponents = layouts;
		paramsStore = params;
	}
}

function onClick(event: MouseEvent) {
	const anchor = (event.target as HTMLElement).closest('a');
	if (!anchor) return;

	const url = new URL(anchor.href);
	const currentOrigin = globalThis.location.origin;
	if (url.origin !== currentOrigin) return;

	event.preventDefault();
	globalThis.history.pushState({}, '', anchor.href);
	onNavigate();
}
