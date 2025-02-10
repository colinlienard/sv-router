# Code Splitting

Code splitting is a technique used to split your code into multiple bundles which can then be loaded on demand or in parallel. This can help reduce the initial load time of your application, though it may be ommited for a home page for example.

You can opt in by suffixing the route filename with `.lazy.svelte`:

```sh
routes
├── about.svelte # [!code --]
├── about.lazy.svelte # [!code ++]
└── index.svelte
```

> [!NOTE]
> This can also be done for [layouts](./routing-concepts#layouts).

See [Preloading](../common/preloading) for more information on how to preload routes.
