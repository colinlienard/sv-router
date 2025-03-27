import { location } from '../create-router.svelte.js';
import { constructPath } from './utils.js';

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
export function isActive(pathname, params) {
	return compare((a, b) => a === b, pathname, params);
}

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
isActive.startsWith = (pathname, params) => {
	return compare((a, b) => a.startsWith(b), pathname, params);
};

/**
 * @param {function(string, string): boolean} compareFn
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
function compare(compareFn, pathname, params) {
	if (!pathname.includes(':')) {
		return compareFn(location.pathname, pathname);
	}

	if (params) {
		return compareFn(location.pathname, constructPath(pathname, params));
	}

	const pathParts = pathname.split('/').slice(1);
	const routeParts = location.pathname.split('/').slice(1);
	for (const [index, pathPart] of pathParts.entries()) {
		const routePart = routeParts[index];
		if (routePart.startsWith(':')) {
			continue;
		}
		return compareFn(pathPart, routePart);
	}
	return false;
}
