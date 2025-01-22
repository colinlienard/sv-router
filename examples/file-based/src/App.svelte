<script lang="ts">
	import { isActiveLink, Router, searchParams } from 'sv-router';
	import { navigate, p } from 'sv-router/generated';

	$inspect(searchParams.toString());
</script>

<a href={p('/')}>Home</a>
<a use:isActiveLink href={p('/about')}>About</a>
<a href={p('/posts')} data-preload>Posts</a>
<button
	onclick={() =>
		navigate('/posts/:id', { params: { id: 'programmatic' }, search: searchParams.toString() })}
>
	Programmatic
</button>
<button
	onclick={() => {
		searchParams.set('test', searchParams.has('test') ? 'ok' : '1');
	}}
>
	ok
</button>
<Router />

<style>
	a:global(.is-active) {
		color: red;
	}
</style>
