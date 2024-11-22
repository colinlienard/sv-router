import type { Routes } from './types.ts';

export let routes: Routes;
export const paramsStore = $state<Record<string, string>>({});

export function createRouter(r: Routes) {
	routes = r;

	if (import.meta.env.DEV) {
		import('./helpers/validate-routes.ts').then(({ validateRoutes }) => {
			validateRoutes(routes);
		});
	}

	return {
		typedPathFn(path: string) {
			return path;
		},
		queryParams() {
			const readonly = $derived(paramsStore);
			return readonly;
		},
	};
}
