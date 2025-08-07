<script module lang="ts">
	import { createRawSnippet } from 'svelte';
	import { vi } from 'vitest';
	import { createRouter } from '../../src/create-router.svelte.js';
	import Router from '../../src/Router.svelte';
	import Layout from './Layout.test.svelte';

	export const onPreloadMock = vi.fn();

	export const { p, navigate, isActive, preload, route } = createRouter({
		'/': createRawSnippet(() => ({ render: () => '<h1>Welcome</h1>' })),
		'/about': createRawSnippet(() => ({ render: () => '<h1>About Us</h1>' })),
		'/user/:id': createRawSnippet(() => ({
			render: () => `<h1>User page</h1>`,
			setup(node) {
				node.append(' ' + route.params.id);
			},
		})),
		'/metadata': {
			'/': createRawSnippet(() => ({ render: () => '<h1>Metadata Page</h1>' })),
			meta: { title: 'Metadata Page' },
		},
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
		'/lazy': {
			'/': () => import('./Lazy.test.svelte'),
			hooks: { onPreload: onPreloadMock },
		},
		'*': createRawSnippet(() => ({ render: () => '<h1>404</h1>' })),
		layout: Layout,
	});
</script>

<script lang="ts">
	let { base } = $props<{ base?: string }>();
</script>

<Router {base} />
