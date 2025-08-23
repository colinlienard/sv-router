<script>
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	/** @type {{ tree: import('svelte').Component[] }} */
	let { tree } = $props();

	const FirstComponent = $derived(tree[0]);
	const restTree = $derived(tree.slice(1));
</script>

<FirstComponent>
	{#if restTree.length > 0}
		<RecursiveComponentTree tree={restTree}></RecursiveComponentTree>
	{/if}
</FirstComponent>
