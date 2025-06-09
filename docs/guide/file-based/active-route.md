# Active Route

## On Links

When building navigation menus, you often need to highlight the currently active route. The `isActiveLink` action simplifies this process.

When applied to an anchor tag, this action automatically adds a CSS class when the link's href matches the current route. By default, it adds the class `is-active`, but you can customize this:

```svelte
<script lang="ts">
	import { isActiveLink } from 'sv-router';
</script>

<a href={p('/about')} use:isActiveLink>About</a>

<!-- With custom class name -->
<a href={p('/about')} use:isActiveLink={{ className: 'custom-class' }}>About</a>

<!-- Active when the route starts with '/about' -->
<a href={p('/about')} use:isActiveLink={{ startsWith: true }}>About</a>
```

## Programmatically

For more complex scenarios, check if a route is active using the `isActive` function, which provides auto-complete and type checking for your routes:

```ts
import { isActive } from 'sv-router/generated';

// Returns true when on '/about'
isActive('/about');

// Returns true when on '/post/123'
isActive('/post/:slug', { slug: '123' });

// Returns true when on '/post/*'
isActive('/post/:slug');

// Returns true when on '/about' or '/about/*'
isActive.startsWith('/about');
```
