<script lang="ts" module>
	import { Router } from 'svelte-path';
	import { p } from './router';
</script>

<a href={p('/')}>Home</a>
<a href={p('/about')}>About</a>
<a href={p('/posts')}>Posts</a>
<Router />
