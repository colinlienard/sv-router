# Hooks

When defining your routes, you can also define hooks that will be executed before or after the route is executed.

This can be useful for authorization, data fetching, etc.

```ts {5-12}
export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': {
		'/': About,
		hooks: {
			beforeLoad() {
			  ...
			},
			afterLoad() {
     	  ...
			},
		},
	},
});
```

These functions will be executed when a route at the same level or below is triggered.

They can be asynchronous, and for the `beforeLoad` hook, this means that the route will not be loaded until the promise is resolved.

You can `throw` in a `beforeLoad` hook to prevent the route from being loaded. To redirect to another route from a hook, you can throw a `navigate` function:

```ts
hooks: {
  async beforeLoad() {
    const user = await someAsyncFunction();
    if (!user.admin) {
      throw navigate('/login');
    }
  }
}
```
