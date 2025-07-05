<script lang="ts">
	import type { Snippet } from 'svelte';
	import { p } from './App.test.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<nav>
	<a href={p('/')}>Home</a>
	<a href={p('/about')}>About</a>
</nav>

{@render children()}
