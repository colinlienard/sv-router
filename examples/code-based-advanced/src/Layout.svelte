<script lang="ts">
	import type { Snippet } from 'svelte';
	import { route } from './router';

	let { children }: { children: Snippet } = $props();
</script>

<main>
	inside layout
	<br />
	Route metadata: {JSON.stringify(route.meta)}
	<br />
	{@render children()}
</main>
