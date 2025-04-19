<script lang="ts">
	import { Router } from 'sv-router';
	import { p } from 'sv-router/generated';
</script>

<h1>Welcome to sv-router</h1>

<a href={p('/')}>Home</a>
<a href={p('/about')}>About</a>

<Router />
