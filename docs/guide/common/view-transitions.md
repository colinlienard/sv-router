# View Transitions

You can enable view transitions by passing the `viewTransition` option to the `navigate` function:

```ts
navigate('/about', { viewTransition: true });
```

Or by adding the `data-view-transition` attribute to an anchor tag:

```svelte
<a href={p('/about')} data-view-transition>About</a>
```

This will wrap the navigation in `document.startViewTransition()`. If not supported, it will fallback to a regular navigation.
