# Code Splitting

Code splitting divides your application into multiple bundles that load on demand or in parallel. This technique reduces initial load times, though you might choose to omit it for frequently accessed pages like your home page.

Implement code splitting by simply suffixing your route filename with `.lazy.svelte`:

```sh
routes
├── about.svelte # [!code --]
├── about.lazy.svelte # [!code ++]
└── index.svelte
```

> [!NOTE]
> Code splitting works equally well with [layouts](./routing-concepts#layouts).

> [!TIP]
> To make all routes lazy by default, use the `allLazy` configuration option instead of manually adding the `.lazy.svelte` suffix to each file. See [Configuration](./configuration#alllazy) for details.

For advanced loading strategies, see [Preloading](../common/preloading).
