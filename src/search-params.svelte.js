import { SvelteURLSearchParams } from 'svelte/reactivity';

let searchParams = new SvelteURLSearchParams(globalThis.location.search);

/** @type {import('./index.js').SearchParams} */
const shell = {
	append(name, value, options) {
		searchParams.append(name, value);
		updateUrlSearchParams(options);
	},
	delete(name, value, options) {
		searchParams.delete(name, value);
		updateUrlSearchParams(options);
	},
	entries() {
		return searchParams.entries();
	},
	forEach(...args) {
		// eslint-disable-next-line unicorn/no-array-for-each
		return searchParams.forEach(...args);
	},
	get(...args) {
		return searchParams.get(...args);
	},
	getAll(...args) {
		return searchParams.getAll(...args);
	},
	has(...args) {
		return searchParams.has(...args);
	},
	keys() {
		return searchParams.keys();
	},
	set(name, value, options) {
		searchParams.set(name, value);
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
		return searchParams.values();
	},
	get size() {
		return searchParams.size;
	},
	[Symbol.iterator]() {
		return searchParams[Symbol.iterator]();
	},
};

export { shell as searchParams };

export function syncSearchParams() {
	const newSearchParams = new URLSearchParams(globalThis.location.search);
	if (searchParams.toString() === newSearchParams.toString()) {
		return;
	}
	searchParams = new SvelteURLSearchParams();
	for (const [key, value] of newSearchParams.entries()) {
		searchParams.append(key, value);
	}
}

/** @param {{ replace?: boolean }} [options] */
function updateUrlSearchParams(options) {
	let url = globalThis.location.origin + globalThis.location.pathname;
	if (searchParams.size > 0) {
		url += '?' + searchParams.toString();
	}
	globalThis.history[options?.replace ? 'replaceState' : 'pushState']({}, '', url);
}
