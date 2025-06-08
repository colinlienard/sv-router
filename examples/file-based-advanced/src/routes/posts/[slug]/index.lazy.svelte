<script lang="ts">
	import { p, route } from 'sv-router/generated';
</script>

<h1>A post with the slug {route.params.slug}</h1>
<a href={p('/posts/comments/:commentId', { commentId: '123' })} data-preload>Comment 1</a>
<a href={p('/posts/comments/:commentId', { commentId: '456' })} data-preload>Comment 2</a>
