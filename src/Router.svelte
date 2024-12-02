<script lang="ts">
	import { on } from 'svelte/events';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';
	import { componentTree, onGlobalClick, onNavigate } from './router.svelte.js';

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
