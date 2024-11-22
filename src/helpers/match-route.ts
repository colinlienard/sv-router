import type { Component } from 'svelte';
import type { Routes } from '../types.ts';

export function matchRoute(
	pathname: string,
	routes: Routes,
): {
	match: Component | undefined;
	layouts: Component[];
	params: Record<string, string>;
} {
	const pathParts = pathname.split('/');
	const allRouteParts = Object.keys(routes).map((route) => route.split('/'));

	let match: Component | undefined;
	const layouts: Component[] = [];
	let params: Record<string, string> = {};

	outer: for (const routeParts of allRouteParts) {
		for (const [index, routePart] of routeParts.entries()) {
			const pathPart = pathParts[index];
			if (routePart.startsWith(':')) {
				params[routePart.slice(1)] = pathPart;
			} else if (routePart === '*') {
				match = routes[routeParts.join('/') as keyof Routes] as Component;
				break outer;
			} else if (routePart !== pathPart) {
				break;
			}
			const routeMatch = routes[routeParts.join('/') as keyof Routes];
			if (
				typeof routeMatch !== 'function' &&
				routeMatch?.layout &&
				!layouts.includes(routeMatch.layout)
			) {
				layouts.push(routeMatch.layout);
			}
			if (index === routeParts.length - 1) {
				if (typeof routeMatch === 'function') {
					if (routeParts.length === pathParts.length) {
						match = routeMatch;
					} else {
						continue;
					}
				} else if (routeMatch) {
					const nestedPathname = '/' + pathParts.slice(index + 1).join('/');
					const result = matchRoute(nestedPathname, routeMatch);
					if (result) {
						match = result.match;
						params = { ...params, ...result.params };
						layouts.push(...result.layouts);
					}
				}
				break outer;
			}
		}
	}

	return { match, layouts, params };
}
