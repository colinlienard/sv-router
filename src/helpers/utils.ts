import type { Component } from 'svelte';
import type { PathParams } from '../types/types.ts';
import type { LazyRouteComponent, RouteComponent } from '../types/types.ts';

export type ConstructPathArgs<T extends string> =
	PathParams<T> extends never ? [T] : [T, PathParams<T>];

export function constructPath<T extends string>(...args: ConstructPathArgs<T>): string {
	const [path, params] = args;
	if (!params) return path;

	let result = path as string;
	for (const key in params) {
		result = result.replace(`:${key}`, params[key]);
	}
	return result;
}

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
	return typeof input === 'function' && !!/\(\)\s?=>\s?import\(.*\)/g.test(String(input));
}
