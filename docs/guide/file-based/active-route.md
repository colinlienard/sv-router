# Active Route

## On Links

When building navigation menus, you often need to highlight the currently active route. The `isActiveLink` attachment simplifies this process.

When applied to an anchor tag, this attachment automatically adds a CSS class when the link's href matches the current route. By default, it adds the class `is-active`, but you can customize this:

```svelte
<script lang="ts">
	import { isActiveLink } from 'sv-router';
</script>

<a href={p('/about')} {@attach isActiveLink()}>About</a>

<!-- With custom class name -->
<a href={p('/about')} {@attach isActiveLink({ className: 'custom-class' })}>

<!-- Active when the route starts with '/about' -->
<a href={p('/about')} {@attach isActiveLink({ startsWith: true })}>
```

> [!NOTE]
> The `className` option supports multiple classes for more complex styling needs:
>
> ```svelte
> <!-- Space-separated classes -->
> <a {@attach isActiveLink({ className: 'active highlighted' })}>
>
> <!-- Using clsx for conditional classes -->
> <a {@attach isActiveLink({ className: clsx('active', isSpecial && 'special')}} )>
> ```

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
