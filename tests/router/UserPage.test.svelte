<script>
	import { outsideState, route, userPageParamsMock } from './App.test.svelte';

	const id = $derived.by(() => {
		userPageParamsMock(route.params.id);
		return route.params.id;
	});
</script>

<h1>User page {id}</h1>
<p>Outside state {outsideState.count}</p>
