import { SvelteURLSearchParams } from 'svelte/reactivity';

let searchParams = new SvelteURLSearchParams(globalThis.location.search);

/** @type {URLSearchParams} */
const shell = {
	append(...args) {
		searchParams.append(...args);
		updateUrlSearchParams();
	},
	delete(...args) {
		searchParams.delete(...args);
		updateUrlSearchParams();
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
	set(...args) {
		searchParams.set(...args);
		updateUrlSearchParams();
	},
	sort() {
		searchParams.sort();
		updateUrlSearchParams();
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

	for (const key of searchParams.keys()) {
		searchParams.delete(key);
	}
	for (const [key, value] of newSearchParams.entries()) {
		searchParams.append(key, value);
	}
}

function updateUrlSearchParams() {
	let url = globalThis.location.origin + globalThis.location.pathname;
	if (searchParams.size > 0) {
		url += '?' + searchParams.toString();
	}
	globalThis.history.pushState({}, '', url);
}
