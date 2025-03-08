# Hooks

When defining routes, you can attach specialized hooks that execute before or after route activation.

These hooks are valuable for implementing authorization checks, data fetching, and other preparatory or cleanup operations.

```ts {5-12} [router.ts]
export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': {
		'/': About,
		hooks: {
			beforeLoad() {
				// Execute before route loads
			},
			afterLoad() {
				// Execute after route loads
			},
		},
	},
});
```

These functions activate when a route at the same level or any nested level is triggered.

Hooks can be asynchronous, and in the case of `beforeLoad`, the route won't load until the promise resolves.

You can `throw` within a `beforeLoad` hook to prevent route loading. For redirecting to another route, throw a `navigate` function:

```ts
hooks: {
	async beforeLoad() {
		const user = await someAsyncFunction();
		if (!user.admin) {
			throw navigate('/login');
		}
	},
};
```

> [!WARNING]
> Hooks can only be used in tree structure, which means that doing the following will not work:
>
> ```ts
> '/about': About,
> '/about/hooks': { ... }, // ❌ Won't work
> ```
