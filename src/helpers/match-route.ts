import type { Component } from 'svelte';
import type { LayoutComponent, RouteComponent, Routes } from '../types/types.ts';

export function matchRoute(
	pathname: string,
	routes: Routes,
): {
	match: RouteComponent | undefined;
	layouts: LayoutComponent[];
	params: Record<string, string>;
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

	outer: for (const routeParts of allRouteParts) {
		for (let [index, routePart] of sortRoutes(routeParts).entries()) {
			const pathPart = pathParts[index];

			const ok = routePart.startsWith('(') && routePart.endsWith(')');
			console.log('pathPart', pathPart, routePart, ok);

			if (routePart.startsWith(':')) {
				params[routePart.slice(1)] = pathPart;
			} else if (ok) {
				routePart = routePart.slice(1, -1);
				layouts = [];
			} else if (routePart === '*') {
				match = routes[routeParts.join('/') as keyof Routes] as Component;
				break outer;
			} else if (routePart !== pathPart) {
				break;
			}

			if (index !== routeParts.length - 1) {
				continue;
			}

			console.log('pre 1', ok);

			if (!ok && 'layout' in routes && routes.layout) {
				console.log('1');
				layouts.push(routes.layout);
			}

			const routeMatch = routes[routeParts.join('/') as keyof Routes] as RouteComponent | Routes;

			console.log('yes', ok);

			if (typeof routeMatch === 'function') {
				console.log('hein', ok);
				if (routeParts.length === pathParts.length) {
					match = routeMatch;
				} else {
					continue;
				}
			} else if (routeMatch) {
				console.log('pre 2', ok);
				const nestedPathname = '/' + pathParts.slice(index + 1).join('/');
				const result = matchRoute(nestedPathname, routeMatch);
				if (result) {
					match = result.match;
					params = { ...params, ...result.params };
					if (!ok) {
						console.log('2', ok);

						layouts.push(...result.layouts);
					}
				}
			}
			break outer;
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
