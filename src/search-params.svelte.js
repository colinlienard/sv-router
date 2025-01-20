import { SvelteURLSearchParams } from 'svelte/reactivity';

export let searchParams = new SvelteURLSearchParams();

export function setupSearchParams() {
	searchParams = new SvelteURLSearchParams(globalThis.location.search);
}

export function effectSearchParam() {
	$effect(() => {
		if (searchParams.size > 0) {
			const url =
				globalThis.location.origin + globalThis.location.pathname + '?' + searchParams.toString();
			globalThis.history.pushState({}, '', url);
		}
	});
}
