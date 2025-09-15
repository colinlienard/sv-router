# Layouts

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

> [!NOTE]
> To apply different layouts to routes at the same level, see [Route Groups](/guide/file-based/route-groups).

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
