import { SvelteURLSearchParams } from 'svelte/reactivity';

// export const ok = $state(
// 	new Proxy(new URLSearchParams(), {
// 		get(target, prop, receiver) {
// 			console.log(target, prop, receiver);
// 			const called = target[prop];
// 			if (typeof called === 'function') {
// 				return function (...args) {
// 					console.log('called', args);
// 					return called.apply(target, args);
// 				};
// 			}
// 			return called;
// 		},
// 	}),
// );

let state = new SvelteURLSearchParams(globalThis.location.search);

/** @type {URLSearchParams} */
export const searchParams = {
	toString() {
		return state.toString();
	},
	set(...args) {
		state.set(...args);
		updateUrlSearchParams();
	},
};

export function clearSearchParams() {
	for (const key of state.keys()) {
		state.delete(key);
	}
}

function updateUrlSearchParams() {
	let url = globalThis.location.origin + globalThis.location.pathname;
	if (state.size > 0) {
		url += '?' + state.toString();
	}
	globalThis.history.pushState({}, '', url);
}
