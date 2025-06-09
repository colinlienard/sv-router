# Basename

If your app doesn't live at the root of a domain (for example, it's hosted at `example.com/my-app` instead of just `example.com`), you need to specify a basename. This tells the router to prepend this path segment to all route URLs.

```svelte [App.svelte]
<script lang="ts">
	import { Router } from 'sv-router';
</script>

<Router base="my-app" />
```
