# Search Params

sv-router provides a convenient way to access and manipulate URL search parameters. The `searchParam` object extends [`SvelteURLSearchParams`](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteURLSearchParams) from Svelte's reactivity API.

It implements the same interface as the native [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object but with two significant advantages:

1. It's fully reactive
2. It automatically updates the URL when modified

```ts
import { searchParams } from 'sv-router';

// Add a parameter
searchParams.append('hello', 'world');

// Remove a parameter
searchParams.delete('hello');

// React to parameter changes
$effect(() => {
	// This effect will re-run whenever the 'hello' parameter changes
	const value = searchParams.get('hello');
	console.log(`Hello parameter is now: ${value}`);
});
```
