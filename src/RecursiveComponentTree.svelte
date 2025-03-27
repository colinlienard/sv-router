<script>
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';
	import { params } from './router.svelte.js';

	/** @type {{ tree: import('svelte').Component[] }} */
	let { tree } = $props();

	const FirstComponent = $derived(tree[0]);
	const restTree = $derived(tree.slice(1));
</script>

{#key restTree.length > 0 || Object.values(params.value)}
	<FirstComponent>
		{#if restTree.length > 0}
			<RecursiveComponentTree tree={restTree}></RecursiveComponentTree>
		{/if}
	</FirstComponent>
{/key}
