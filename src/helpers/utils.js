import { base } from '../create-router.svelte.js';

/**
 * @param {string} path
 * @param {Record<string, string | number | boolean>} [params]
 * @returns {string}
 */
export function constructPath(path, params) {
	if (params) {
		for (const key in params) {
			path = path.replace(`:${key}`, () => encodeURIComponent(params[key]));
		}
	}

	if (base.name === '#') {
		if (path === '/') {
			return '/#/';
		}
		return join('#', path);
	}
	if (base.name) {
		return join(base.name, path);
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
async function resolveRouteComponent(input) {
	if (isLazyImport(input)) {
		const module = await input();
		if (!module) {
			throw new Error('Failed to load route component: the lazy import resolved to nothing');
		}
		return module.default;
	}
	return input;
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
 * Split a pathname into its segments, ignoring leading and trailing slashes.
 *
 * @param {string} pathname
 * @returns {string[]}
 */
export function toPathParts(pathname) {
	return pathname.replace(/\/+$/, '').split('/').slice(1);
}

/**
 * Compare a route template against the current path, segment by segment.
 *
 * Static segments are compared case-insensitively, to stay consistent with `matchRoute`. Param
 * values remain case-sensitive, as they do when matching a route.
 *
 * @param {string[]} templateParts The segments of the route to check, params included as `:name`.
 * @param {string[]} pathParts The segments of the path to compare against.
 * @param {boolean} [startsWith] Whether the path only needs to start with the route.
 * @param {Record<string, string>} [params] The expected values of the params, if any.
 * @returns {boolean}
 */
export function comparePathParts(templateParts, pathParts, startsWith, params) {
	if (
		startsWith ? pathParts.length < templateParts.length : pathParts.length !== templateParts.length
	) {
		return false;
	}

	for (const [index, templatePart] of templateParts.entries()) {
		const pathPart = pathParts[index];
		if (templatePart.startsWith(':')) {
			if (params && encodeURIComponent(params[templatePart.slice(1)]) !== pathPart) {
				return false;
			}
		} else if (templatePart.toLowerCase() !== pathPart.toLowerCase()) {
			return false;
		}
	}
	return true;
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

/** @param {any} state */
export function getUserState(state) {
	if (state && '_userState' in state) {
		return state._userState;
	}
	return state;
}

export function updatedLocation() {
	const pathname = base.name === '#' ? location.hash.slice(1) : location.pathname;
	const hash = base.name === '#' ? '' : location.hash;
	return {
		pathname,
		search: location.search,
		state: getUserState(history.state),
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
			[...searchParams].map(([key, value]) => [key, parseSearchValue(value)]),
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
