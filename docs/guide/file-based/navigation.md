# Navigation

## Links

Similar to SvelteKit, standard anchor tags provide basic navigation between pages:

```svelte
<a href="/about">About</a>
```

To leverage type-safe navigation, use the `p` function, which provides auto-complete and type checking for your routes.

```svelte
<script lang="ts">
	import { p } from 'sv-router/generated';
</script>

<a href={p('/about')}>About</a>
```

You can also pass parameters and additional options:

```svelte
<a
  href={p('/post/:slug', { params: { slug: '123' }, search: { q: 'hello' } })}
  data-replace
  data-state="{ from: 'home' }"
>
  A post
</a>
```

## Programmatic Navigation

For navigation triggered by JavaScript events, use the `navigate` function, which also provides auto-complete and type checking for your routes:

```svelte
<script lang="ts">
	import { navigate } from 'sv-router/generated';
</script>

<button onclick={() => navigate('/about')}>About</button>
```

Similarly, you can pass parameters and additional options:

```ts
navigate('/post/:slug', {
	params: {
		slug: '123',
	},
	replace: true,
	search: { q: 'hello' },
	state: '{ from: "home" }',
	hash: 'first-section',
});
```

The `navigate` function also supports traversing through browser history, similar to the native [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API):

```ts
// Go back one page (equivalent to the browser's back button)
navigate(-1);

// Go forward one page (equivalent to the browser's forward button)
navigate(1);

// Go back two pages
navigate(-2);
```
