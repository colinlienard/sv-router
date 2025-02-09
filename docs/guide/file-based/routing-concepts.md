# Routing Concepts

## Flat Mode or Tree Mode

When defining your routes, you can choose between two modes: flat or tree. In flat mode, all routes are defined at the root level of the router. In tree mode, routes are defined as a tree structure.

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

You can also mix-and-match both modes in the same router.

## Dynamic Routes

To define dynamic routes, you can surround a route segment with square brackets. This will match any value for that segment.

You can also define multiple dynamic segments in a single route.

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

To access the dynamic segments in your component, you can use the `route.params` object.

```svelte [Post.svelte]
<script lang="ts">
	import { route } from 'sv-router/generated';

	route.params; // Typed as { id?: string, postId?: string }
</script>

<main>
	<h1>Post</h1>
	<p>User ID: {route.params.id}</p>
	<p>Post ID: {route.params.postId}</p>
</main>
```

## Catch-All Routes

If you want to match any route that hasn't been matched by other routes, you can define a catch-all route using the `*` wildcard.

```sh
routes
└── *.svelte                           ➜ /not-found
```

You can define an optional name that you will then be able to access in your component using `route.params` similarly to dynamic routes.

```sh
routes
└── *notfound.svelte                   ➜ /not-found
```

## Layouts

You can define a component that will wrap the other routes at the same level or below using layouts:

```sh{4}
routes
└── about
   ├── index.svelte
   ├── layout.svelte
   ├── team.svelte
   └── work.svelte
```

This layout component must render children:

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
> When changing routes that are using the same layout, the layout component will not be re-created. This is useful to avoid re-triggering side effects.
