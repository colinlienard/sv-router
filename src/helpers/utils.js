import { base } from '../create-router.svelte.js';

/**
 * @param {string} path
 * @param {Record<string, string>} [params]
 * @returns {string}
 */
export function constructPath(path, params) {
	if (params) {
		for (const key in params) {
			path = path.replace(`:${key}`, params[key]);
		}
	}

	if (base.name === '#') {
		const url = new URL(globalThis.location.toString());
		url.hash = path;
		url.search = '';

		return url.toString();
	}

	return path;
}

/**
 * @param {import('../index.d.ts').RouteComponent[]} input
 * @returns {Promise<import('svelte').Component[]>}
 */
export function resolveRouteComponents(input) {
	return Promise.all(input.map((c) => resolveRouteComponent(c)));
}

/**
 * @param {import('../index.d.ts').RouteComponent} input
 * @returns {Promise<import('svelte').Component>}
 */
function resolveRouteComponent(input) {
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

/**
 * @param {unknown} input
 * @returns {input is import('../index.d.ts').LazyRouteComponent}
 */
export function isLazyImport(input) {
	return typeof input === 'function' && !!/\(\)\s?=>\s?import\(.*\)/.test(String(input));
}

/** @param {...string} parts */
export function join(...parts) {
	let result = '';
	for (let part of parts) {
		if (!part.startsWith('/')) {
			result += '/';
		}
		if (part.endsWith('/')) {
			part = part.slice(0, -1);
		}
		result += part;
	}
	return result;
}

/**
 * @param {string} pathname
 * @returns {string}
 */
export function stripBase(pathname) {
	if (base.name && pathname.startsWith(base.name)) {
		pathname = pathname.slice(base.name.length) || '/';
	}
	return pathname;
}

export function updatedLocation() {
	const pathname =
		base.name === '#' ? globalThis.location.hash.slice(1) : globalThis.location.pathname;
	const hash = base.name === '#' ? '' : globalThis.location.hash;
	return {
		pathname,
		search: globalThis.location.search,
		state: history.state,
		hash,
	};
}
