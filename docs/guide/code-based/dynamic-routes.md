# Dynamic Routes

To create dynamic routes that match variable segments, prefix a route segment with a colon `:`. This allows that segment to match any value.

Multiple dynamic segments can be included in a single route:

::: code-group

```ts [Flat mode]
'/user/:id': User,
'/user/:id/post/:postId': Post,
```

```ts [Tree mode]
'/user': {
  '/:id': {
    '/': User,
    post: {
      '/:postId': Post,
    },
  },
}
```

:::

You can access these dynamic segments in your components in two different ways:

- **Strict:** `route.getParams` is a function that requires a pathname to be passed as an argument. It will throw an error if the pathname does not match the current route.
- **Non-strict:** `route.params` is an object typed as a partial record with all the possible params in the app.

```svelte [Post.svelte]
<script lang="ts">
	import { route } from '../router';

	// Typed as { id: string, postId: string }
	route.getParams('/user/:id/post/:postId');

	// Typed as { id?: string, postId?: string, ... }
	route.params;
</script>
```
