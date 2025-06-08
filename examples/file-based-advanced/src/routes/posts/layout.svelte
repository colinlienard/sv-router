<script lang="ts">
	import { route } from 'sv-router/generated';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<main>
	inside layout
	{JSON.stringify(route.meta)}
	{@render children()}
</main>
