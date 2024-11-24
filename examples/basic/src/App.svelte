<script lang="ts" module>
	import { Router } from 'svelte-path';
	import { goto, path } from './router';
</script>

<a href={path('/')}>Home</a>
<a href={path('/about')}>About</a>
<a href={path('/posts')}>Posts</a>
<button onclick={() => goto('/about')}>Programmatic</button>
<Router />
