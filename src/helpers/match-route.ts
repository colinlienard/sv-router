import type { Component } from 'svelte';
import type { LayoutComponent, RouteComponent, Routes } from '../types/index.ts';

export function matchRoute(
	pathname: string,
	routes: Routes,
): {
	match: RouteComponent | undefined;
	layouts: LayoutComponent[];
	params: Record<string, string>;
} {
	const pathParts = pathname.split('/');
	const allRouteParts = sortRoutes(Object.keys(routes)).map((route) => route.split('/'));

	let match: RouteComponent | undefined;
	const layouts: LayoutComponent[] = [];
	let params: Record<string, string> = {};

	outer: for (const routeParts of allRouteParts) {
		for (const [index, routePart] of sortRoutes(routeParts).entries()) {
			const pathPart = pathParts[index];
			if (routePart.startsWith(':')) {
				params[routePart.slice(1)] = pathPart;
			} else if (routePart === '*') {
				match = routes[routeParts.join('/') as keyof Routes] as Component;
				break outer;
			} else if (routePart !== pathPart) {
				break;
			}
			const routeMatch = routes[routeParts.join('/') as keyof Routes] as RouteComponent | Routes;
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

export function sortRoutes(routes: string[]) {
	return routes.toSorted((a, b) => getRoutePriority(a) - getRoutePriority(b));
}

function getRoutePriority(route: string): number {
	if (route === '' || route === '/') return 1;
	if (route === '*') return 4;
	if (route.includes(':')) return 3;
	return 2;
}
