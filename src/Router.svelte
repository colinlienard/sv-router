<script>
	import { on } from 'svelte/events';
	import { base, componentTree, onGlobalClick, onNavigate } from './create-router.svelte.js';
	import { join } from './helpers/utils.js';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	/** @type {{ base?: string }} */
	let { base: basename } = $props();

	const url = new URL(globalThis.location.href);
	if (basename) {
		base.name = (basename.startsWith('/') ? '' : '/') + basename;
		if (!url.pathname.startsWith(base.name)) {
			url.pathname = join(base.name, url.pathname);
			history.replaceState(history.state || {}, '', url.href);
		}
	}

	onNavigate(url.pathname, {
		search: url.search,
		hash: url.hash,
	});

	$effect(() => {
		const off1 = on(globalThis, 'popstate', () =>
			onNavigate(url.pathname, {
				search: url.search,
				hash: url.hash,
			}),
		);
		const off2 = on(globalThis, 'click', onGlobalClick);

		return () => {
			off1();
			off2();
		};
	});
</script>

<RecursiveComponentTree tree={componentTree.value}></RecursiveComponentTree>
