# Setup

Let's say that you already have created to components `Home.svelte` and `About.svelte` that you want to use as routes.

You must first define the routes of your app in a file that will then export methods to use the router. Let's call this file `router.ts`.

```ts [router.ts]
import { createRouter } from 'sv-router';
import Home from './routes/Home.svelte';
import About from './routes/About.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': About,
});
```

In the entrypoint component of your app, you should then import and the `Router` component - it will take care of rendering the correct route.

You can also add links to navigate between the routes. You should now have an app with working navigation!

```svelte [App.svelte]
<script lang="ts">
	import { Router } from 'sv-router';
</script>

<a href="/">Home</a>
<a href="/about">About</a>

<Router />
```

You can now learn more about the routing concepts.
