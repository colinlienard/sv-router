# Hooks

When defining routes, you can attach specialized hooks that execute before or after route activation.

These hooks are valuable for implementing authorization checks, data fetching, and other preparatory or cleanup operations.

```ts {5-15} [router.ts]
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
			onPreload() {
				// Execute when the route is preloaded
			},
			onError() {
				// Execute when route components fail to load or beforeLoad hooks throw an error
			},
		},
	},
});
```

> [!WARNING]
> Hooks can only be used in tree structure, which means that doing the following will not work:
>
> ```ts
> '/about': About,
> '/about/hooks': { ... }, // ❌ Won't work
> ```

These functions activate when a route at the same level or any nested level is triggered.

Hooks can be asynchronous, and in the case of `beforeLoad`, the route won't load until the promise resolves.

You can `throw` within a `beforeLoad` hook to prevent route loading. For redirecting to another route, throw a `navigate` function:

```ts
hooks: {
	async beforeLoad() {
		const user = await someAsyncFunction();
		if (!user.admin) {
			throw redirect('/login');
		}
	},
};
```

All hooks receive a context object with information about the current navigation, which you can use to block navigation for example:

```ts
hooks: {
	beforeLoad({ pathname, search, hash, state, replace, meta }) {
   if (!admin && pathname !== "/") {
         throw redirect("/");
       }
	},
};
```
