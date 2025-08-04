# Basename

If your app doesn't live at the root of a domain (for example, it's hosted at `example.com/my-app` instead of just `example.com`), you need to specify a basename. This tells the router to prepend this path segment to all route URLs.

```svelte [App.svelte]
<script lang="ts">
	import { Router } from 'sv-router';
</script>

<Router base="my-app" />
```

## Hash-based routing

If `#` is used as the base, the router will switch to a hash based routing approach. Routes will not be matched by the URLs pathname but by its hash. This also means that the hash segment of the URL is exclusively used for routing and cannot be utilized otherwise and usage of the [hash option](../../reference#navigate-path-options) in `navigate(path, options?)` will be ignored.

This is particularly useful when serving the application from disk via a `file://` url.
