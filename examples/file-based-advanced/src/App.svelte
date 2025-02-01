<script lang="ts">
	import { isActiveLink, Router } from 'sv-router';
	import { isActive, navigate, p } from 'sv-router/generated';
</script>

<a href={p('/')} use:isActiveLink >Home</a>
<a href={p('/about')} use:isActiveLink >About</a>
<a href={p('/posts')} use:isActiveLink data-preload>Posts</a>
<a href={p('/a/more/nested/route')} use:isActiveLink >A more nested route</a>
<a href={p('/unauthorized')}>Unauthorizdata-preloaded</a>
<buttondata-preload
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
