<script lang="ts">
	import type { RouteProps } from '../../src/index.js';
	import { route as globalRoute, routePropMock, routePropReader } from './App.test.svelte';

	let { route }: RouteProps<'/route-prop/:id'> = $props();

	const id = $derived.by(() => {
		routePropMock(route.pathname, route.params.id, globalRoute.pathname);
		return route.params.id;
	});

	routePropReader.read = () => `${route.pathname} ${route.params.id}`;

	function leave(_node: Element) {
		return { duration: 50 };
	}
</script>

<h1 out:leave|global>Route prop {id}</h1>
