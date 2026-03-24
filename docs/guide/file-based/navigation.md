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

You can prevent users from accidentally leaving a page with unsaved changes using the `blockNavigation` function. It takes a callback that returns `true` to allow navigation or `false` to block it, and returns a cleanup function to remove the blocker:

```svelte
<script lang="ts">
	import { blockNavigation } from 'sv-router';

	let hasUnsavedChanges = $state(false);

	$effect(() =>
		blockNavigation(() => {
			if (!hasUnsavedChanges) return true;
			return confirm('You have unsaved changes. Leave anyway?');
		}),
	);
</script>
```

This blocks all navigation types: link clicks, programmatic navigation, and browser back/forward buttons.

The blocker persists until the cleanup function is called. You can register multiple blockers; navigation is blocked if any of them returns `false`.

### Async blocking

If you need to perform asynchronous work before deciding whether to allow navigation (e.g. showing a custom modal), the callback can be async:

```svelte
<script lang="ts">
	import { blockNavigation } from 'sv-router';

	$effect(() =>
		blockNavigation(async () => {
			return await showConfirmModal();
		}),
	);
</script>
```

### Blocking tab close

To also prevent the user from closing or refreshing the tab, use the object form and add a `beforeUnload` method. This is opt-in because browser `beforeunload` dialogs cannot be customized and may be disruptive:

```svelte
<script lang="ts">
	import { blockNavigation } from 'sv-router';

	$effect(() =>
		blockNavigation({
			beforeUnload() {
				return false; // prevents tab close
			},
			async onNavigate() {
				return await showConfirmModal();
			},
		}),
	);
</script>
```

> [!NOTE]
> `beforeUnload` must be synchronous (browser limitation), while `onNavigate` can be async.
