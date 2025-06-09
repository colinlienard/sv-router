# Dynamic Routes

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
