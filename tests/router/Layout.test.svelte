<script lang="ts">
	import type { Snippet } from 'svelte';
	import { p } from './App.test.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<nav>
	<a href={p('/')}>Home</a>
	<a href={p('/about')}>About</a>
	<a href={p('/user/:id', { id: '456' })}>User 456</a>
	<a href={p('/protected')}>Protected</a>
	<a href={p('/slow-protected')}>Slow Protected</a>
	<a href={p('/lazy')} data-preload>Lazy</a>
	<a href="https://example.com" target="_blank">External</a>
</nav>

{@render children()}
