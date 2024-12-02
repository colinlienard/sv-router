<script lang="ts">
	import type { Component } from 'svelte';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';
	import { paramsStore } from './router.svelte.js';

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
