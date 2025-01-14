<script lang="ts">
	import { Router } from 'sv-router';
	import { goto, path } from 'sv-router/generated';
</script>

<a href={path('/')}>Home</a>
<a href={path('/about')}>About</a>
<a href={path('/posts')} data-preload>Posts</a>
<button onclick={() => goto('/posts/:id', { id: 'programmatic' })}>Programmatic</button>
<Router />
