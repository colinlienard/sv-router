<script lang="ts">
	import { Router } from 'sv-router';
	import { isActive, navigate, p } from 'sv-router/generated';
</script>

<a href={p('/')}>Home {isActive('/')}</a>
<a href={p('/about')}>About {isActive('/about')}</a>
<a href={p('/posts')} data-preload>Posts {isActive('/posts')}</a>
<button onclick={() => navigate('/posts/:id', { params: { id: 'programmatic' } })}>
	Programmatic
</button>
<Router />
