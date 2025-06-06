# Routing Concepts

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

## Dynamic Routes

To create dynamic routes that match variable segments, prefix a route segment with a colon `:`. This allows that segment to match any value.

Multiple dynamic segments can be included in a single route:

```ts
'/user/:id': User,
'/user/:id/post/:postId': Post,
```

You can access these dynamic segments in your components in two different ways:

- **Strict:** `route.getParams` is a function that requires a pathname to be passed as an argument. It will throw an error if the pathname does not match the current route.
- **Non-strict:** `route.params` is an object typed as a partial record with all the possible params in the app.

```svelte [Post.svelte]
<script lang="ts">
	import { route } from '../router';

	// Typed as { postId: string }
	route.getParams('/post/:postId');

	// Typed as { id?: string, postId?: string }
	route.params;
</script>
```

## Catch-All Routes

To handle any unmatched routes, define a catch-all route using the `*` symbol:

```ts
'*': NotFound,
```

You can optionally name the parameter, which allows you to access the unmatched part of the URL via `route.params` similar to dynamic routes:

```ts
'*notfound': NotFound,
```

## Layouts

Define a wrapping component for routes at the same level or below using layouts:

```ts{5}
'/about': {
	'/': About,
	'/work': Work,
	'/team': Team,
	layout: AboutLayout,
},
```

This layout component must render its children:

```svelte [AboutLayout.svelte]
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="wrapper">
	{@render children()}
</div>
```

> [!NOTE]
> When navigating between routes that share the same layout, the layout component persists without being recreated. This prevents unnecessary side effect triggers.

> [!WARNING]
> Layouts can only be used in tree structure, which means that doing the following will not work:
>
> ```ts
> '/about': About,
> '/about/layout': AboutLayout, // ❌ Won't work
> ```

## Break Out of Layouts

Sometimes you may want certain routes to ignore their parent's layout. You can exclude a route from inheriting its parent layout by wrapping the route segment in parentheses:

```ts{5}
'/about': {
	'/': About, // Uses AboutLayout
	'/work': {
		"/": Work, // Uses AboutLayout
		"/(clients)": Clients, // Ignores AboutLayout
	},
	layout: AboutLayout,
},
```

This pattern works for all route types, including dynamic segments and catch-all routes:

```ts
// Dynamic route that ignores parent layout
"/(:id)": PostId,

// Catch-all route that ignores parent layout
"(*notfound)": NotFound,
```

This technique allows you to selectively bypass layouts while maintaining your overall route hierarchy.
