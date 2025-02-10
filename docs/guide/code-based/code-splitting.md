# Code Splitting

Code splitting is a technique used to split your code into multiple bundles which can then be loaded on demand or in parallel. This can help reduce the initial load time of your application, though it may be ommited for a home page for example.

You can opt in by using the `import()` function:

```ts [router.ts]
import { createRouter } from 'sv-router';
import Home from './routes/Home.svelte';
import About from './routes/About.svelte'; // [!code --]

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': About, // [!code --]
	'/about': () => import('./routes/About.svelte'), // [!code ++]
});
```

> [!NOTE]
> This can also be done for [layouts](./routing-concepts#layouts).

See [Preloading](../common/preloading) for more information on how to preload routes.
