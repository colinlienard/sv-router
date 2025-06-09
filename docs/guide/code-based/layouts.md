# Layouts

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
