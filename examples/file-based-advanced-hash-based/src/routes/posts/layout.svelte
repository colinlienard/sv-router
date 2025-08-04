<script lang="ts">
	import { route } from 'sv-router/generated';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<main>
	inside layout
	<br />
	Route metadata: {JSON.stringify(route.meta)}
	<br />
	{@render children()}
</main>
