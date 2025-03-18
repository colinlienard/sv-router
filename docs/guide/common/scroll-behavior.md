# Scroll Behavior

## Scroll To Top

By default, the router automatically scrolls to the top of the page when navigating to a new route. You can customize this behavior on a per-navigation basis by providing a `scrollToTop` option:

```ts
// Default behavior - scroll to top instantly
navigate('/about');

// Scroll to top with smooth animation
navigate('/about', { scrollToTop: 'smooth' });

// Prevent scrolling to top
navigate('/about', { scrollToTop: false });
```

This property accepts the same values as the `behavior` parameter of the browser's [`scrollTo` method](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo#parameters).

For standard anchor tags, control scroll behavior with the `data-scroll-to-top` attribute:

```svelte
<!-- Default behavior - scroll to top instantly -->
<a href={p('/about')}>About</a>

<!-- Scroll to top with smooth animation -->
<a href={p('/about')} data-scroll-to-top="smooth">About</a>

<!-- Prevent scrolling to top -->
<a href={p('/about')} data-scroll-to-top="false">About</a>
```

## Scroll Position Restoration

sv-router leverages the browser's native scroll restoration mechanism by default. This means that when using the browser back/forward buttons, scroll positions are automatically restored.

If you want to implement your own scroll restoration logic or disable it entirely, you can opt-out of the browser's native behavior through the [`scrollRestoration` property of the History API](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration):

```ts
history.scrollRestoration = 'manual';
```
