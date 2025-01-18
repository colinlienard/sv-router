import { location } from '../create-router.svelte.js';

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isActive(pathname) {
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
