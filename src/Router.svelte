<script>
	import { on } from 'svelte/events';
	import {
		componentTree,
		init,
		onBeforeUnload,
		onGlobalClick,
		onNavigate,
	} from './create-router.svelte.js';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	/** @type {{ base?: string }} */
	let { base: basename } = $props();

	init(basename);

	onNavigate();

	$effect(() => {
		const cleanup = [
			on(globalThis, 'popstate', () => onNavigate()),
			on(globalThis, 'beforeunload', onBeforeUnload),
			on(globalThis, 'click', onGlobalClick),
		];

		return () => {
			for (const clean of cleanup) {
				clean();
			}
		};
	});
</script>

<RecursiveComponentTree tree={componentTree.value}></RecursiveComponentTree>
