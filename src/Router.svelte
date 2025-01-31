<script>
	import { on } from 'svelte/events';
	import { componentTree, onGlobalClick, onNavigate } from './create-router.svelte.js';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	// onNavigate();
	onNavigate().catch(() => {});

	$effect(() => {
		const off1 = on(globalThis, 'popstate', () => {
			// onNavigate();
			onNavigate().catch(() => {});
		});
		const off2 = on(globalThis, 'click', onGlobalClick);

		return () => {
			off1();
			off2();
		};
	});
</script>

<RecursiveComponentTree tree={componentTree.value}></RecursiveComponentTree>
