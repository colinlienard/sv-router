<script lang="ts">
	import { isActiveLink, Router } from 'sv-router';
	import { navigate, p } from 'sv-router/generated';
</script>

<a href={p('/')}>Home</a>
<a use:isActiveLink href={p('/about')}>About</a>
<a href={p('/posts')} data-preload>Posts</a>
<button onclick={() => navigate('/posts/:id', { params: { id: 'programmatic' } })}>
	Programmatic
</button>
<Router />

<style>
	a:global(.is-active) {
		color: red;
	}
</style>
