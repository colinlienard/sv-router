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
	data-state={`{ "from": "home" }`}
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
	state: { from: 'home' },
	hash: 'first-section',
});
```

The `navigate` function returns a promise that resolves once the navigation is complete, including any redirects triggered by `beforeLoad` hooks and lazy-loaded route components. You can `await` it when you need to perform actions after the navigation has fully settled:

```ts
await navigate('/dashboard');
// The navigation is complete, including any redirects or code splitting
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

## Blocking Navigation

You can prevent users from accidentally leaving a page with unsaved changes using the `blockNavigation` function. It takes a callback that returns `true` to allow navigation or `false` to block it:

```svelte
<script lang="ts">
	import { blockNavigation } from 'sv-router';

	let hasUnsavedChanges = $state(false);

	blockNavigation(() => {
		if (!hasUnsavedChanges) return true;
		return confirm('You have unsaved changes. Leave anyway?');
	});
</script>
```

This blocks all navigation types: link clicks, programmatic navigation, and browser back/forward buttons.

The blocker is automatically cleared after allowing navigation once. To set up a persistent blocker, call `blockNavigation` again.
