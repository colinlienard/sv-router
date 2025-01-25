<script lang="ts">
	import { isActiveLink, Router } from 'sv-router';
	import { isActive, navigate, p } from './router';
</script>

<a href={p('/')} use:isActiveLink data-preload>Home</a>
<a href={p('/about')} use:isActiveLink data-preload>About</a>
<a href={p('/posts')} use:isActiveLink data-preload>Posts</a>
<a href={p('/a/more/nested/route')} use:isActiveLink data-preload>A more nested route</a>
<button
	onclick={() => navigate('/posts/:slug', { params: { slug: 'static' }, search: 'hello=world' })}
>
	Programmatic
</button>
<pre>Is inside `/posts/*`: {isActive('/posts/:slug')}</pre>
<Router />

<style>
	a:global(.is-active) {
		color: red;
	}
</style>
