# Route Groups

Route groups allow you to organize route files together without affecting the actual URL path by prefixing the folder name with an underscore. This is useful for grouping related routes under a shared layout or structure while keeping the URL clean.

```sh
routes
├── index.svelte        ➜ /
└── _marketing
    ├── about.svelte    ➜ /about
    └── contact.svelte  ➜ /contact
```

In this example, both `/about` and `/contact` are available at the root level, the `_marketing` folder name is ignored in the URL.

## Combining with Layouts

You can add a `layout.svelte` inside a route group to wrap all its child routes, without exposing the group name in the URL. This is useful when you have multiple groups (e.g. `_dashboard` and `_app`) that each need different layouts.

```sh
routes
├── about.svelte             ➜ /about
└── _dashboard
    ├── layout.svelte
    ├── index.svelte         ➜ /
    └── settings.svelte      ➜ /settings
```

Here, `layout.svelte` is shared across `/` and `/settings`, even though the `_dashboard` folder doesn’t show up in the path, and `/about` remains unwrapped even though it's at the same level as the other routes.

> [!TIP]
> You can also combine it with `meta` and `hooks`.
>
> ```sh {4,5}
> routes
> └── _dashboard
>    ├── layout.svelte
>    ├── hooks.ts
>    ├── meta.ts
>    └── index.svelte
> ```
