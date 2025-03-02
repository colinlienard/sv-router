# Code Splitting

Code splitting divides your application into multiple bundles that load on demand or in parallel. This technique significantly reduces initial load times, though you might choose to omit it for frequently accessed pages like your home page.

Implement code splitting by simply suffixing your route filename with `.lazy.svelte`:

```sh
routes
├── about.svelte # [!code --]
├── about.lazy.svelte # [!code ++]
└── index.svelte
```

> [!NOTE]
> Code splitting works equally well with [layouts](./routing-concepts#layouts).

For advanced loading strategies, see [Preloading](../common/preloading).
