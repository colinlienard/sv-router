<script lang="ts">
	import type { Component } from 'svelte';
	import { paramsStore } from './create-router.svelte.js';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	let { tree }: { tree: Component[] } = $props();

	const FirstComponent = $derived(tree[0]);
	const restTree = $derived(tree.slice(1));
</script>

{#key restTree.length > 0 || Object.values(paramsStore)}
	<FirstComponent>
		{#if restTree.length > 0}
			<RecursiveComponentTree tree={restTree}></RecursiveComponentTree>
		{/if}
	</FirstComponent>
{/key}
