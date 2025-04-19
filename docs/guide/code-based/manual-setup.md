# Manual Setup

Let's assume you've already created two components, `Home.svelte` and `About.svelte`, that you want to use as routes.

First, define your application's routes in a dedicated file that will export methods for interacting with the router. We'll name this file `router.ts`.

```ts [router.ts]
import { createRouter } from 'sv-router';
import Home from './routes/Home.svelte';
import About from './routes/About.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': About,
});
```

Next, in your application's entry point component, import and use the `Router` component, which handles rendering the active route.

Add links to enable navigation between routes, and you'll have a functioning navigation system:

```svelte [App.svelte]
<script lang="ts">
	import { Router } from 'sv-router';
	import './router.ts';
</script>

<a href="/">Home</a>
<a href="/about">About</a>

<Router />
```

Continue reading to learn more about advanced routing concepts.
