import { base, location } from '../create-router.svelte.js';
import { constructPath, join } from './utils.js';

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
export function isActive(pathname, params) {
	const p = base.name && base.name !== '#' ? join(base.name, pathname) : pathname;
	return compare((a, b) => a === b, p, params);
}

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
isActive.startsWith = (pathname, params) => {
	const p = base.name && base.name !== '#' ? join(base.name, pathname) : pathname;
	return compare((a, b) => a.startsWith(b), p, params);
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
		if (base.name === '#') {
			return compareFn(location.pathname, new URL(constructPath(pathname, params)).hash.slice(1));
		} else {
			return compareFn(location.pathname, constructPath(pathname, params));
		}
	}

	const pathParts = pathname.split('/').slice(1);
	let routeParts = location.pathname.split('/').slice(1);
	if (pathParts.length > routeParts.length) {
		return false;
	}
	for (const [index, pathPart] of pathParts.entries()) {
		const routePart = routeParts[index];
		if (pathPart.startsWith(':')) {
			continue;
		}
		if (pathPart !== routePart) {
			return false;
		}
	}
	return true;
}
