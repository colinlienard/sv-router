import type { Component } from 'svelte';
import type { LazyRouteComponent, RouteComponent } from '../types/index.ts';

export function resolveRouteComponents(input: RouteComponent<any>[]): Promise<Component[]> {
	return Promise.all(input.map((c) => resolveRouteComponent(c)));
}

export function resolveRouteComponent(input: RouteComponent): Promise<Component> {
	return new Promise((resolve) => {
		if (isLazyImport(input)) {
			Promise.resolve(input()).then((module) => {
				resolve(module.default);
			});
		} else {
			resolve(input);
		}
	});
}

export function isLazyImport(input: unknown): input is LazyRouteComponent {
	return typeof input === 'function' && !!/\(\)\s=>\simport\(.*\)/g.test(String(input));
}
