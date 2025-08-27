<script lang="ts">
	import { p } from 'sv-router/generated';
</script>

<h1>Posts</h1>
<a href={p('/posts/:slug', { params: { slug: 'hello-world' } })}>Hello world</a>
<a href={p('/posts/:slug', { params: { slug: 'foo-bar' } })}>Foo bar</a>
