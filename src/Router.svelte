<script lang="ts">
	import type { Component } from 'svelte';
	import { on } from 'svelte/events';
	import { paramsStore, routes } from './create-router.svelte.ts';
	import { matchRoute } from './helpers/match-route.ts';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	let componentTree = $state<Component[]>([]);

	function onNavigate() {
		const { match, layouts, params } = matchRoute(globalThis.location.pathname, routes);
		componentTree = match ? [...layouts, match] : layouts;
		Object.assign(paramsStore, params);
	}

	function onGlobalClick(event: Event) {
		const anchor = (event.target as HTMLElement).closest('a');
		if (!anchor) return;

		const url = new URL(anchor.href);
		const currentOrigin = globalThis.location.origin;
		if (url.origin !== currentOrigin) return;

		event.preventDefault();
		globalThis.history.pushState({}, '', anchor.href);
		onNavigate();
	}

	onNavigate();

	$effect(() => {
		const off1 = on(globalThis, 'popstate', onNavigate);
		const off2 = on(globalThis, 'click', onGlobalClick);

		return () => {
			off1();
			off2();
		};
	});
</script>

<RecursiveComponentTree tree={componentTree}></RecursiveComponentTree>
