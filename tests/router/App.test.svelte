<script module lang="ts">
	import { createRawSnippet } from 'svelte';
	import { createRouter } from '../../src/create-router.svelte.js';
	import Router from '../../src/Router.svelte';
	import Layout from './Layout.test.svelte';

	export const { p, navigate, isActive, preload, route } = createRouter({
		'/': createRawSnippet(() => ({ render: () => '<h1>Welcome</h1>' })),
		'/about': createRawSnippet(() => ({ render: () => '<h1>About Us</h1>' })),
		'/protected': {
			'/': createRawSnippet(() => ({ render: () => '<h1>Protected Page</h1>' })),
			hooks: {
				beforeLoad() {
					throw navigate('/');
				},
			},
		},
		'/slow-protected': {
			'/': createRawSnippet(() => ({ render: () => '<h1>Protected Page</h1>' })),
			hooks: {
				async beforeLoad() {
					await new Promise((resolve) => setTimeout(resolve, 100));
					throw navigate('/');
				},
			},
		},
		'/lazy': async () => ({
			default: createRawSnippet(() => ({ render: () => '<h1>Lazy Page</h1>' })),
		}),
		layout: Layout,
	});
</script>

<script lang="ts">
	let { base } = $props<{ base?: string }>();
</script>

<Router {base} />
