# Active Route

## On links

Often when you have links in your app, you want to highlight the link that corresponds to the current route. This is where the `isActiveLink` action comes in.

When used on an anchor tag, the `isActiveLink` action will add a class to the anchor tag if the href matches the current route. This class defaults to `is-active` but can be customized.

```svelte
<a href="/about" use:isActiveLink>About</a>

// With custom class
<a href="/about" use:isActiveLink={{ className: 'custom-class' }}>About</a>
```

## Programmatically

You can also check if a route is active programmatically using the `isActiveRoute` function.

```ts
import { isActive } from 'sv-router';

isActive('/about'); // true on `/about`

// With a specific param
isActive('/post/:slug', { slug: '123' }); // true on `/post/123`

// With any param
isActive('/post/:slug'); // true on `/post/123`
```
