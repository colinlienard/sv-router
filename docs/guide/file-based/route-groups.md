# Route Groups

Route groups let you organize route files together without affecting the actual URL path. This is useful for grouping related routes under a shared layout or structure while keeping the URL clean.

```sh
routes
├── index.svelte        ➜ /
└── (marketing)
    ├── about.svelte    ➜ /about
    └── contact.svelte  ➜ /contact
```

In this example, both `/about` and `/contact` are available at the root level, the `(marketing)` folder name is ignored in the URL.

## Combining with Layouts

You can add a `layout.svelte` inside a route group to wrap all its child routes, without exposing the group name in the URL. This is useful when you have multiple groups (e.g. `(dashboard)` and `(app)`) that each need different layouts.

```sh
routes
└── (dashboard)
    ├── layout.svelte
    ├── index.svelte         ➜ /
    └── settings.svelte      ➜ /settings
```

Here, `layout.svelte` is shared across `/` and `/settings`, even though the `(dashboard)` folder doesn’t show up in the path.

> [!TIP]
> You can also combine it with `meta` and `hooks`.
> ```sh {4,5}
> routes
> └── (dashboard)
>    ├── layout.svelte
>    ├── hooks.ts
>    ├── meta.ts
>    └── index.svelte
>```
