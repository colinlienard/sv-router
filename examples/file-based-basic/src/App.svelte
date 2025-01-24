<script lang="ts">
	import { Router } from 'sv-router';
	import { navigate, p } from 'sv-router/generated';
</script>

<a href={p('/')}>Home</a>
<a href={p('/about')}>About</a>
<a href={p('/posts')}>Posts</a>
<button onclick={() => navigate('/posts/static')}>Programmatic</button>
<Router />
