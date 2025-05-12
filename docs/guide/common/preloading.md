# Preloading

Preloading loads the next page in the background while users interact with the current page. This technique can reduces perceived loading times when users navigate to the preloaded page.

For preloading to work effectively, you must first implement code splitting for the route you want to preload. See the **code-splitting guide** ([code-based](../code-based/code-splitting.md) or [file-based](../file-based/code-splitting.md)) for implementation details.

## On Links

To enable preloading, simply add a `data-preload` attribute to the link that triggers navigation:

```svelte
<a href="/about" data-preload>About</a>
```

When users hover over this link, the About page component will begin loading in the background, ensuring it's ready (or nearly ready) by the time they click.

## Programmatically

You can also preload a route programatically with the `preload` function:

::: code-group

```ts [Code-based]
import { preload } from './router';

await preload('/about');
```

```ts [File-based]
import { preload } from 'sv-router/generated';

await preload('/about');
```

:::
