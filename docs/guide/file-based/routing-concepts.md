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

Access these dynamic segments in your components using the `route.params` object:

```svelte [Post.svelte]
<script lang="ts">
	import { route } from 'sv-router/generated';

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

```sh
routes
└── *.svelte                           ➜ /not-found
```

You can assign an optional name to this wildcard, which you can then access via `route.params` similar to dynamic routes:

```sh
routes
└── *notfound.svelte                   ➜ /not-found
```

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
