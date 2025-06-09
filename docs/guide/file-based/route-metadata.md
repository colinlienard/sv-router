# Route Metadata

You can attach arbitrary data to routes using the `meta` property. This is useful for authentication guards, UI configuration, analytics tracking, and more.

```sh {4}
routes
└── about
   ├── index.svelte
   └── meta.ts
```

```ts [meta.ts]
export default {
	public: false,
};
```

> [!NOTE]
>
> When routes are nested, metadata from parent routes is merged with child route metadata:
>
> ```sh
> routes
> └── dashboard
>    ├── index.svelte
>    └── meta.ts                  ➜ { section: 'app', requiresAuth: true }
>       ├── index.svelte
>       └── meta.ts               ➜ { subsection: 'preferences' }
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
