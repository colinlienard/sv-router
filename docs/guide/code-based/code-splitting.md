# Code Splitting

Code splitting divides your application into multiple bundles that load on demand or in parallel. This technique significantly reduces initial load times, though you might choose to omit it for frequently accessed pages like your home page.

Implement code splitting using the `import()` function:

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
> Code splitting works equally well with [layouts](./routing-concepts#layouts).

For advanced loading strategies, see [Preloading](../common/preloading).
