# Preloading

Preloading is a technique that allows you to load the next page in the background while the user is interacting with the current page. This can significantly reduce the perceived loading time of the next page.

For preloading to work, you need to first code-split the route you want to preload. See the [code-splitting](../code-based/code-splitting.md) guide for more information.

You can add a `data-preload` attribute to an anchor to preload the route when the user hovers over the link:

```svelte
<a href="/about" data-preload>About</a>
```
