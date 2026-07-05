---
title: Route Metadata (Code-based)
description: Attach arbitrary metadata to code-based routes for authentication guards, UI configuration, or analytics tracking.
---

# Route Metadata

You can attach arbitrary data to routes using the `meta` property. This is useful for authentication guards, UI configuration, analytics tracking, and more.

```ts {5-7} [router.ts]
export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': {
		'/': About,
		meta: {
			public: true,
		},
	},
});
```

> [!NOTE]
>
> When routes are nested, metadata from parent routes is merged with child route metadata:
>
> ```ts [router.ts]
> '/dashboard': {
>   '/': Dashboard,
>   meta: {
>     section: 'app',
>     requiresAuth: true,
>   },
>   '/settings': {
>     '/': Settings,
>     meta: {
>       public: false,
>     },
>   },
> },
> ```
>
> The `/dashboard/settings` route will have metadata: `{ section: 'app', requiresAuth: true, subsection: 'preferences' }`.

## Accessing Metadata

You can access route metadata in your components using the `route` object:

```svelte [Protected.svelte]
<script lang="ts">
	import { route } from '../router';

	$effect(() => {
		console.log('Route is public:', route.meta.public);
	});
</script>
```

## Resolving Metadata for a Path

The `route` object only exposes the metadata of the _current_ route. To read the merged metadata of any route without navigating to it, use `resolveMeta`:

```ts [menu.ts]
import { resolveMeta } from '../router';

const items = [
	{ label: 'Dashboard', path: '/dashboard' },
	{ label: 'Settings', path: '/dashboard/settings' },
] as const;

const allowed = items.filter((item) => resolveMeta(item.path).requiresAuth !== true);
```

Like the `route.meta` getter, `resolveMeta` merges metadata from all ancestor route levels. It returns an empty object for a route that has no metadata.

## Typing Metadata

By default, metadata is typed as `Record<string, any>`. You can customize this for better type safety:

```ts
declare module 'sv-router' {
	interface RouteMeta {
		public?: boolean;
		requiresAuth?: boolean;
		section?: string;
	}
}
```
