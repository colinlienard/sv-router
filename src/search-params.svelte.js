import { SvelteURLSearchParams } from 'svelte/reactivity';
import { parseSearchValue } from './helpers/utils.js';

let searchParams = new SvelteURLSearchParams(globalThis.location.search);

/** @type {import('./index.js').SearchParams} */
const shell = {
	append(name, value, options) {
		searchParams.append(name, String(value));
		updateUrlSearchParams(options);
	},
	delete(name, value, options) {
		searchParams.delete(name, value === undefined ? undefined : String(value));
		updateUrlSearchParams(options);
	},
	entries() {
		return [...searchParams.entries()].map(([key, value]) => [key, parseSearchValue(value)]);
	},
	forEach(...args) {
		return searchParams.forEach(...args);
	},
	get(...args) {
		const value = searchParams.get(...args);
		if (value === null) return null;
		return parseSearchValue(value);
	},
	getAll(...args) {
		return searchParams.getAll(...args).map(parseSearchValue);
	},
	has(...args) {
		return searchParams.has(...args);
	},
	keys() {
		return searchParams.keys();
	},
	set(name, value, options) {
		searchParams.set(name, String(value));
		updateUrlSearchParams(options);
	},
	sort(options) {
		searchParams.sort();
		updateUrlSearchParams(options);
	},
	toString() {
		return searchParams.toString();
	},
	values() {
		return [...searchParams.values()].map(parseSearchValue);
	},
	get size() {
		return searchParams.size;
	},
	[Symbol.iterator]() {
		return searchParams[Symbol.iterator]();
	},
};

export { shell as searchParams };

/** @param {string} [search] */
export function syncSearchParams(search) {
	if (searchParams.toString() === search) {
		return;
	}
	const newSearch = new URLSearchParams(search);
	for (const [key, value] of newSearch) {
		searchParams.set(key, value);
	}
	for (const key of searchParams.keys()) {
		if (!newSearch.has(key)) {
			searchParams.delete(key);
		}
	}
}

/** @param {{ replace?: boolean }} [options] */
function updateUrlSearchParams(options) {
	const url = new URL(globalThis.location.toString());
	url.search = searchParams.toString();
	globalThis.history[options?.replace ? 'replaceState' : 'pushState']({}, '', url);
}
