import { BROWSER, DEV } from 'esm-env';
import type { Path, Routes } from './types/index.ts';

export let routes: Routes;
export const paramsStore = $state<Record<string, string>>({});

export function createRouter<T extends Routes>(r: T) {
	routes = r;

	if (DEV && BROWSER) {
		import('./helpers/validate-routes.ts').then(({ validateRoutes }) => {
			validateRoutes(routes);
		});
	}

	return {
		typedPathFn(path: Path<T>) {
			return path;
		},
		queryParams() {
			const readonly = $derived(paramsStore);
			return readonly;
		},
	};
}
