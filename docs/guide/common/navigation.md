# Navigation

## Links

Similarly to SvelteKit, just using anchor tags is sufficient to navigate between pages:

```svelte
<a href="/about">About</a>
```

But to take advantage of navigation type-safety, you can use the `p` function:

::: code-group

```svelte [code-based]
<script lang="ts">
	// From where you have called the `createRoute` function`
	import { p } from '../router.ts';
</script>

<a href={p('/about')}>About</a>
```

```svelte [file-based]
<script lang="ts">
	import { p } from 'sv-router/generated';
</script>

<a href={p('/about')}>About</a>
```

:::

You can also pass params and other options:

```svelte
<a
  href={p('/post/:slug', { slug: '123' })}
  data-replace
  data-state="{ from: 'home' }"
>
  A post
</a>
```

## Programmatic Navigation

To navigate programmatically, you can use the `navigate` function:

::: code-group

```svelte [code-based]
<script lang="ts">
	import { navigate } from '../router.ts';
</script>

<button on:click={() => navigate('/about')}>About</button>
```

```svelte [file-based]
<script lang="ts">
	import { navigate } from 'sv-router/generated';
</script>

<button on:click={() => navigate('/about')}>About</button>
```

:::

Similarly, you can pass params and other options:

```ts
navigate('/post/:slug', {
	params: {
		slug: '123',
	},
	replace: true,
	search: '?q=hello',
	state: '{ from: "home" }',
	hash: 'first-section',
});
```

You can also navigate back or forward:

```ts
navigate.back();
navigate.forward();
```
