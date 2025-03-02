# Active Route

## On Links

When building navigation menus, you often need to highlight the currently active route. The `isActiveLink` action simplifies this process.

When applied to an anchor tag, this action automatically adds a CSS class when the link's href matches the current route. By default, it adds the class `is-active`, but you can customize this:

```svelte
<a href="/about" use:isActiveLink>About</a>

<!-- With custom class name -->
<a href="/about" use:isActiveLink={{ className: 'custom-class' }}>About</a>
```

## Programmatically

For more complex scenarios, check if a route is active using the `isActiveRoute` function:

```ts
import { isActive } from 'sv-router';

// Check if we're on the about page
isActive('/about'); // returns true when on '/about'

// Check with a specific parameter
isActive('/post/:slug', { slug: '123' }); // returns true when on '/post/123'

// Check with any parameter value
isActive('/post/:slug'); // returns true on any '/post/{value}' route
```
