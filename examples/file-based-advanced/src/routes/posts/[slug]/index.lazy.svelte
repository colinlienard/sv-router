<script lang="ts">
	import { p, route } from 'sv-router/generated';
</script>

<h1>A post with the slug {route.params.slug}</h1>
<a href={p('/posts/comments/:commentId', { params: { commentId: '123' } })} data-preload="predict">
	Comment 1
</a>
<a href={p('/posts/comments/:commentId', { params: { commentId: '456' } })} data-preload="predict">
	Comment 2
</a>
