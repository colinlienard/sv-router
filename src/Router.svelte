<script>
	import { on } from 'svelte/events';
	import { base, componentTree, onGlobalClick, onNavigate } from './create-router.svelte.js';
	import { join } from './helpers/utils.js';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	/** @type {{ base?: string }} */
	let { base: basename } = $props();

	if (basename) {
		base.name = basename;
		const url = new URL(globalThis.location.href);
		if (!url.pathname.startsWith(basename)) {
			url.pathname = join(basename, url.pathname);
			history.replaceState(history.state || {}, '', url.href);
		}
	}

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
