<script lang="ts">
	import { isActiveLink, Router } from 'sv-router';
	import { isActive, navigate, p } from 'sv-router/generated';
</script>

<a href={p('/')} {@attach isActiveLink()}>Home</a>
<a href={p('/about')} {@attach isActiveLink()}>About</a>
<a href={p('/contact')} {@attach isActiveLink()}>Contact</a>
<a href={p('/posts')} {@attach isActiveLink({ startsWith: true })} data-preload>Posts</a>
<a href={p('/a/more/nested/route')} {@attach isActiveLink()}>A more nested route</a>
<a href={p('/unauthorized')}>Unauthorized</a>
<button
	onclick={() =>
		navigate('/posts/:slug', { params: { slug: 'static' }, search: { hello: 'world' } })}
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
