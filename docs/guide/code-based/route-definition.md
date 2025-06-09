# Route Definition

All routes are defined in a single configuration object passed to `createRouter`, which returns methods and properties you'll use throughout your application for navigation and route management:

```ts [router.ts]
import { createRouter } from 'sv-router';
import Home from './routes/Home.svelte';
import About from './routes/About.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': About,
});
```

> [!NOTE]
> Routes are case-insensitive and trailing slashes are ignored, meaning `/about` and `/About/` are treated as the same route.

## Flat Mode or Tree Mode

When defining routes, you can choose between two organizational structures: flat or tree. Flat mode defines all routes at the router's root level, while tree mode organizes routes in a hierarchical structure.

```ts [router.ts]
// Flat Mode
'/about': About,
'/about/work': Work,
'/about/work/mywork': MyWork,
'/about/contact': Contact,

// Tree Mode
'/about': {
  '/': About,
  '/work': {
    '/': Work,
    '/mywork': MyWork,
  },
  '/contact': Contact,
},
```

You can effectively combine both modes within the same router configuration for maximum flexibility.
