# Search Params

`sv-router` provides an easy way to access and edit search params from the URL. The `searchParam` object is a wrapper around [`SvelteURLSearchParams`](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteURLSearchParams) from the Svelte reactivity API.

It has exactly the same API as the native `URLSearchParams` object, but with the added benefit of being reactive, and updating the URL automatically:

```ts
import { searchParams } from 'sv-router';

searchParams.append('hello', 'world');

searchParams.delete('hello');

$effect(() => {
	// Will trigger on change
	searchParams.get('hello');
});
```
