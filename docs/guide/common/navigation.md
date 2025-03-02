# Navigation

## Links

Similar to SvelteKit, standard anchor tags provide basic navigation between pages:

```svelte
<a href="/about">About</a>
```

For enhanced type safety, use the `p` function:

::: code-group

```svelte [Code-based]
<script lang="ts">
	import { p } from '../router';
</script>

<a href={p('/about')}>About</a>
```

```svelte [File-based]
<script lang="ts">
	import { p } from 'sv-router/generated';
</script>

<a href={p('/about')}>About</a>
```

:::

You can also pass parameters and additional options:

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

For navigation triggered by JavaScript events, use the `navigate` function:

::: code-group

```svelte [Code-based]
<script lang="ts">
	import { navigate } from '../router';
</script>

<button on:click={() => navigate('/about')}>About</button>
```

```svelte [File-based]
<script lang="ts">
	import { navigate } from 'sv-router/generated';
</script>

<button on:click={() => navigate('/about')}>About</button>
```

:::

Similarly, you can pass parameters and additional options:

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

For browser history navigation, use:

```ts
navigate.back();
navigate.forward();
```
