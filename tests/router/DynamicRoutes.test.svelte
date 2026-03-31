<script module lang="ts">
	import { createRawSnippet } from 'svelte';
	import { createRouter } from '../../src/create-router.svelte.js';
	import type { Routes } from '../../src/index.js';
	import Router from '../../src/Router.svelte';

	const routes: Routes = {
		'/foo': createRawSnippet(() => ({ render: () => '<h1>Foo Page</h1>' })),
		'/bar': createRawSnippet(() => ({ render: () => '<h1>Bar Page</h1>' })),
		'*': createRawSnippet(() => ({ render: () => '<h1>Not Found</h1>' })),
	};

	const YoloSnippet = createRawSnippet(() => ({ render: () => '<h1>Yolo Page</h1>' }));

	export const { navigate, route } = createRouter(routes);

	export function setYoloRoute(enabled: boolean) {
		if (enabled) {
			routes['/yolo'] = YoloSnippet;
		} else {
			delete routes['/yolo'];
		}
	}
</script>

<Router />
