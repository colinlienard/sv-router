import { location } from '../create-router.svelte.js';
import { constructPath } from './utils.js';

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
export function isActive(pathname, params) {
	if (!pathname.includes(':')) {
		return pathname === location.pathname;
	}

	if (params) {
		return constructPath(pathname, params) === location.pathname;
	}

	const pathParts = pathname.split('/').slice(1);
	const routeParts = location.pathname.split('/').slice(1);
	if (pathParts.length !== routeParts.length) {
		return false;
	}
	for (const [index, pathPart] of pathParts.entries()) {
		const routePart = routeParts[index];
		if (routePart.startsWith(':')) {
			continue;
		}
		return pathPart === routePart;
	}
	return false;
}
