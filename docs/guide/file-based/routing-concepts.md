# Routing Concepts

## Flat Mode or Tree Mode

When defining routes, you can choose between two organizational structures: flat or tree. Flat mode defines all routes at the root level, while tree mode organizes routes in a hierarchical directory structure.

```sh
# Flat
routes
├── about.svelte                       ➜ /about
├── about.contact.svelte               ➜ /about/contact
├── about.work.svelte                  ➜ /about/work
└── about.work.mywork.svelte           ➜ /about/work/mywork

# Tree
routes
└── about
   ├── contact.svelte                  ➜ /about/contact
   ├── index.svelte                    ➜ /about
   └── work
      ├── index.svelte                 ➜ /about/work
      └── mywork.svelte                ➜ /about/work/mywork
```

You can effectively combine both modes within the same router configuration for maximum flexibility.

## Dynamic Routes

To create dynamic routes that match variable segments, surround the segment name with square brackets. This allows that segment to match any value.

You can include multiple dynamic segments in a single route:

::: code-group

```sh [Flat mode]
routes
├── user.[id].svelte                   ➜ /user/123
└── user.[id].post.[postId].svelte     ➜ /user/123/post/456
```

```sh [Tree mode]
routes
└── user
   └── [id]
      ├── index.svelte                 ➜ /user/123
      └── post
         └── [postId].svelte           ➜ /user/123/post/456
```

:::

You can access these dynamic segments in your components in two different ways:

- **Strict:** `route.getParams` is a function that requires a pathname to be passed as an argument. It will throw an error if the pathname does not match the current route.
- **Non-strict:** `route.params` is an object typed as a partial record with all the possible params in the app.

```svelte [user.(|id|).post.(|postId|).svelte]
<script lang="ts">
	import { route } from 'sv-router/generated';

	// Typed as { id: string, postId: string }
	route.getParams('/user/:id/post/:postId');

	// Typed as { id?: string, postId?: string, ... }
	route.params;
</script>
```

## Catch-All Routes

To handle any unmatched routes, define a catch-all route using the spread syntax:

```sh
routes
└── [...notfound].svelte               ➜ /any-path
```

You can access the unmatched part of the URL via `route.params` (with the `notfound` key in this example) similar to dynamic routes.

## Layouts

Define a wrapping component for routes at the same level or below using layouts:

```sh{4}
routes
└── about
   ├── index.svelte
   ├── layout.svelte
   ├── team.svelte
   └── work.svelte
```

This layout component must render its children:

```svelte [layout.svelte]
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="wrapper">
	{@render children()}
</div>
```

> [!NOTE]
> When navigating between routes that share the same layout, the layout component persists without being recreated. This prevents unnecessary side effect triggers

> [!WARNING]
> Layouts can only be used in tree structure, which means that doing the following will not work:
>
> ```sh
> routes
> ├── about.svelte
> └── about.layout.svelte # ❌ Won't work
> ```

## Break Out of Layouts

Sometimes you may want certain routes to ignore their parent's layout. You can exclude a route from inheriting its parent layout by wrapping the route segment in parentheses:

```sh{7}
routes
└── about
   ├── index.svelte                    ➜ Uses layout
   ├── layout.svelte
   └── work
      ├── index.svelte                 ➜ Uses layout
      └── (clients).svelte             ➜ Ignores layout
```

This pattern works for all route types, including dynamic segments and catch-all routes:

```sh
# Dynamic route that ignores parent layout
routes
└── ([id]).svelte

# Catch-all route that ignores parent layout
routes
└── ([...notfound]).svelte
```

This technique allows you to selectively bypass layouts while maintaining your overall route hierarchy.
