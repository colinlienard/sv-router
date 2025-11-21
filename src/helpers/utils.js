import { base } from '../create-router.svelte.js';

/**
 * @param {string} path
 * @param {Record<string, string | number | boolean>} [params]
 * @returns {string}
 */
export function constructPath(path, params) {
	if (params) {
		for (const key in params) {
			path = path.replace(`:${key}`, String(params[key]));
		}
	}

	if (base.name === '#') {
		if (path === '/') {
			return '/#/';
		}
		return join('#', path);
	}

	return path;
}

/**
 * @param {string} path
 * @param {import('../index.d.ts').ConstructUrlOptions & {
 * 	params?: Record<string, string | number | boolean>;
 * }} [options]
 * @returns {string}
 */
export function constructUrl(path, options) {
	let result = constructPath(path, options?.params);
	if (options?.search) {
		result += serializeSearch(options.search);
	}
	if (options?.hash && !options.hash.startsWith('#')) {
		result += '#' + options.hash;
	}
	return result;
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
	return (
		typeof input === 'function' &&
		!!/\(\)\s?=>\s?(import|__vite_ssr_dynamic_import__)\(.*\)/.test(String(input))
	);
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

/**
 * @param {import('../index.d.ts').Search} [value]
 * @returns {string | undefined}
 */
export function serializeSearch(value) {
	if (!value) {
		return;
	}

	if (typeof value === 'string') {
		if (!value.startsWith('?')) {
			value = '?' + value;
		}
		return value;
	}

	const stringValues = Object.fromEntries(
		Object.entries(value).map(([key, value]) => [key, String(value)]),
	);
	if (Object.keys(stringValues).length === 0) {
		return;
	}
	const urlSearchParams = new URLSearchParams(stringValues);
	return '?' + urlSearchParams.toString();
}

/**
 * @param {import('../index.d.ts').Search} [value]
 * @returns {Record<string, string | number | boolean>}
 */
export function parseSearch(value) {
	if (!value) {
		return {};
	}

	if (typeof value === 'string') {
		const searchParams = new URLSearchParams(value);
		return Object.fromEntries(
			[...searchParams.entries()].map(([key, value]) => [key, parseSearchValue(value)]),
		);
	}

	return value;
}

/**
 * @param {string} value
 * @returns {string | number | boolean}
 */
export function parseSearchValue(value) {
	if (value === '') {
		return '';
	}
	if (value === 'true') {
		return true;
	}
	if (value === 'false') {
		return false;
	}
	const number = Number(value);
	if (!Number.isNaN(number)) {
		return number;
	}
	return value;
}
