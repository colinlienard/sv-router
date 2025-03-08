# Hooks

When defining routes, you can attach specialized hooks that execute before or after route activation.

These hooks are valuable for implementing authorization checks, data fetching, and other preparatory or cleanup operations.

Create a dedicated `hooks.ts` file within your route directory:

```sh {3}
routes
└── about
   ├── hooks.ts
   └── index.svelte
```

```ts [hooks.ts]
import type { Hooks } from 'sv-router';

export default {
	beforeLoad() {
		// Execute before route loads
	},
	afterLoad() {
		// Execute after route loads
	},
} satisfies Hooks;
```

These functions activate when a route at the same level or any nested level is triggered.

Hooks can be asynchronous, and in the case of `beforeLoad`, the route won't load until the promise resolves.

You can `throw` within a `beforeLoad` hook to prevent route loading. For redirecting to another route, throw a `navigate` function:

```ts
async function beforeLoad() {
	const user = await someAsyncFunction();
	if (!user.admin) {
		throw navigate('/login');
	}
}
```

> [!WARNING]
> Hooks can only be used in tree structure, which means that doing the following will not work:
>
> ```sh
> routes
> ├── about.svelte
> └── about.hooks.svelte # ❌ Won't work
> ```
