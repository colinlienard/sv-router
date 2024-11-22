<script lang="ts">
	import type { Component } from 'svelte';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	let { tree }: { tree: Component[] } = $props();

	const FirstComponent = $derived(tree[0]);
	const restTree = $derived(tree.slice(1));
</script>

<FirstComponent>
	{#if restTree.length > 0}
		<RecursiveComponentTree tree={restTree}></RecursiveComponentTree>
	{/if}
</FirstComponent>
