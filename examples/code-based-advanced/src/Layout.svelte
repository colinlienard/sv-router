<script lang="ts">
	import type { Snippet } from 'svelte';
	import { route } from './router';

	let { children }: { children: Snippet } = $props();
</script>

<main>
	inside layout
	{JSON.stringify(route.meta)}
	{@render children()}
</main>
