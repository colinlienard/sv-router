import type { Component } from 'svelte';
import type { LayoutComponent, RouteComponent, Routes } from '../types/types.ts';

export function matchRoute(
	pathname: string,
	routes: Routes,
): {
	match: RouteComponent | undefined;
	layouts: LayoutComponent[];
	params: Record<string, string>;
	breakFromLayouts: boolean;
} {
	// Remove trailing slash
	if (pathname.length > 1 && pathname.endsWith('/')) {
		pathname = pathname.slice(0, -1);
	}
	const pathParts = pathname.split('/');
	const allRouteParts = sortRoutes(Object.keys(routes)).map((route) => route.split('/'));

	let match: RouteComponent | undefined;
	let layouts: LayoutComponent[] = [];
	let params: Record<string, string> = {};
	let breakFromLayouts = false;

	outer: for (const routeParts of allRouteParts) {
		// eslint-disable-next-line prefer-const
		for (let [index, routePart] of sortRoutes(routeParts).entries()) {
			const pathPart = pathParts[index];

			breakFromLayouts = routePart.startsWith('(') && routePart.endsWith(')');
			if (breakFromLayouts) {
				routePart = routePart.slice(1, -1);
			}

			if (routePart.startsWith(':')) {
				params[routePart.slice(1)] = pathPart;
			} else if (routePart === '*') {
				match = routes[routeParts.join('/') as keyof Routes] as Component;
				break outer;
			} else if (routePart !== pathPart) {
				break;
			}

			if (index !== routeParts.length - 1) {
				continue;
			}

			if (!breakFromLayouts && 'layout' in routes && routes.layout) {
				layouts.push(routes.layout);
			}

			const routeMatch = routes[routeParts.join('/') as keyof Routes] as RouteComponent | Routes;

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
					if (result.breakFromLayouts) {
						layouts = [];
					} else {
						layouts.push(...result.layouts);
					}
				}
			}
			break outer;
		}
	}

	return { match, layouts, params, breakFromLayouts };
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
