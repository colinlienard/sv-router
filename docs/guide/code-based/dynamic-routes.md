---
title: Dynamic Routes (Code-based)
description: Create dynamic code-based routes with colon-prefixed segments and access their parameters through route.params and route.getParams.
---

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

A dynamic segment can also be combined with static text, which is useful for routes like `/@username`:

```ts
'/@:username': Profile,
'/posts/:id.json': PostJson,
```

Such a route only matches if the static parts are present: the URL `/@john` matches `/@:username` with `username` set to `'john'`, while `/john` does not.

When several routes can match the same URL, the most specific one wins. Given these routes, the URL `/@me` renders `Me`, `/@john` renders `Profile`, and `/john` renders `Slug`:

```ts
'/@me': Me,             // static
'/@:username': Profile, // static text + param
'/:slug': Slug,         // param only
```

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
