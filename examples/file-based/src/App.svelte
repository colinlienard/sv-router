<script lang="ts">
	import { Router } from 'sv-router';
	import { navigate, p } from 'sv-router/generated';
</script>

<a href={p('/')}>Home</a>
<a href={p('/about')}>About</a>
<a href={p('/posts')} data-preload>Posts</a>
<button onclick={() => navigate('/posts/:id', { id: 'programmatic' })}>Programmatic</button>
<Router />
