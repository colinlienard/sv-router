<script lang="ts">
	import './router.ts';
	import { Router } from 'sv-router';
	import { p } from './router';
</script>

<h1>Welcome to sv-router</h1>

<a href={p('/')}>Home</a>
<a href={p('/about')}>About</a>

<Router />
