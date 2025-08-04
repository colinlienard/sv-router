<script lang="ts">
	import { searchParams } from 'sv-router';

	function randomString() {
		return Math.random().toString(36).slice(7);
	}
</script>

<h1>Home</h1>
<button onclick={() => searchParams.append(randomString(), randomString())}>
	Add random search param
</button>
<button onclick={() => searchParams.delete([...searchParams.keys()][0])}>
	Remove first search param
</button>
<ul>
	{#each searchParams.entries() as [key, value] (key)}
		<li>{key}: {value}</li>
	{/each}
</ul>
