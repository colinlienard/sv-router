import { location } from '../create-router.svelte.js';
import { comparePathParts, stripBase, toPathParts } from './utils.js';

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
export function isActive(pathname, params) {
	return compare(pathname, false, params);
}

/**
 * @param {string} pathname
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
isActive.startsWith = (pathname, params) => {
	return compare(pathname, true, params);
};

/**
 * @param {string} pathname
 * @param {boolean} startsWith
 * @param {Record<string, string>} [params]
 * @returns {boolean}
 */
function compare(pathname, startsWith, params) {
	return comparePathParts(
		toPathParts(pathname),
		toPathParts(stripBase(location.pathname)),
		startsWith,
		params,
	);
}
