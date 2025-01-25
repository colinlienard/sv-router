<script lang="ts">
	import { p } from '../router';
</script>

<h1>Posts</h1>
<a href={p('/posts/:slug', { slug: 'hello-world' })}>Hello world</a>
<a href={p('/posts/:slug', { slug: 'foo-bar' })}>Foo bar</a>
