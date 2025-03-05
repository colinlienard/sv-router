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

```ts [router.ts]
'/user/:id': User,
'/user/:id/post/:postId': Post,
```

Access these dynamic segments in your components using the `route.params` object:

```svelte [Post.svelte]
<script lang="ts">
	import { route } from '../router';

	// Typed as { id?: string, postId?: string }
	route.params;
</script>

<main>
	<h1>Post</h1>
	<p>User ID: {route.params.id}</p>
	<p>Post ID: {route.params.postId}</p>
</main>
```

## Catch-All Routes

To handle any unmatched routes, define a catch-all route using the `*` wildcard:

```ts [router.ts]
'*': NotFound,
```

You can assign an optional name to this wildcard, which you can then access via `route.params` similar to dynamic routes:

```ts [router.ts]
'*notfound': NotFound,
```

## Layouts

Define a wrapping component for routes at the same level or below using layouts:

```ts{5} [router.ts]
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

## Break Out of Layouts

Sometimes you may want certain routes to ignore their parent's layout. You can exclude a route from inheriting its parent layout by wrapping the route segment in parentheses:

```ts{5} [router.ts]
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

```ts [router.ts]
// Dynamic route that ignores parent layout
"/(:id)": PostId,

// Catch-all route that ignores parent layout
"(*notfound)": NotFound,
```

This technique allows you to selectively bypass layouts while maintaining your overall route hierarchy.
