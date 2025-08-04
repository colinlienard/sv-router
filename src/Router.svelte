<script>
	import { on } from 'svelte/events';
	import { componentTree, init, onGlobalClick, onNavigate } from './create-router.svelte.js';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	/** @type {{ base?: string }} */
	let { base: basename } = $props();

	init(basename);

	onNavigate();

	$effect(() => {
		const off1 = on(globalThis, 'popstate', () => onNavigate());
		const off2 = on(globalThis, 'click', onGlobalClick);

		return () => {
			off1();
			off2();
		};
	});
</script>

<RecursiveComponentTree tree={componentTree.value}></RecursiveComponentTree>
