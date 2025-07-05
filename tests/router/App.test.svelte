<script module lang="ts">
	import { createRawSnippet } from 'svelte';
	import { createRouter } from '../../src/create-router.svelte.js';
	import Router from '../../src/Router.svelte';
	import Layout from './Layout.test.svelte';

	export const { p, navigate, isActive, preload, route } = createRouter({
		'/': createRawSnippet(() => ({ render: () => '<h1>Welcome</h1>' })),
		'/about': createRawSnippet(() => ({ render: () => '<h1>About Us</h1>' })),
		layout: Layout,
	});
</script>

<Router />
