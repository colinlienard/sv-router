<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isActiveLink } from '../../src/index.js';
	import { p } from './App.test.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<nav>
	<a href={p('/')} {@attach isActiveLink()}>Home</a>
	<a href={p('/about')} {@attach isActiveLink()}>About</a>
	<a href={p('/metadata')}>Metadata</a>
	<a href={p('/user/:id', { params: { id: '456' } })}>User 456</a>
	<a href={p('/protected')}>Protected</a>
	<a href={p('/slow-protected')}>Slow Protected</a>
	<a href={p('/lazy')} data-preload>Lazy</a>
	<a href="https://example.com" target="_blank">External</a>
</nav>

{@render children()}
