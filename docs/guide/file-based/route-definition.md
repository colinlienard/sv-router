# Route Definition

In file-based routing, you create routes by placing `.svelte` files in the `routes` directory. Each file automatically becomes a route based on its filename and location.

Unlike code-based routing where you manually define route mappings, file-based routing automatically generates the router configuration for you. This generated code lives in the `.router` directory and exports methods and properties you'll use throughout your application for navigation and route management

You can access these generated exports through the `sv-router/generated` entry point:

```ts
import { navigate, ... } from 'sv-router/generated';
```

> [!NOTE]
> Routes are case-insensitive and trailing slashes are ignored, meaning `/about` and `/About/` are treated as the same route.

## Flat Mode or Tree Mode

When defining routes, you can choose between two organizational structures: flat or tree. Flat mode defines all routes at the root level, while tree mode organizes routes in a hierarchical directory structure.

```sh
# Flat
routes
├── about.svelte                       ➜ /about
├── about.contact.svelte               ➜ /about/contact
├── about.work.svelte                  ➜ /about/work
└── about.work.mywork.svelte           ➜ /about/work/mywork

# Tree
routes
└── about
   ├── contact.svelte                  ➜ /about/contact
   ├── index.svelte                    ➜ /about
   └── work
      ├── index.svelte                 ➜ /about/work
      └── mywork.svelte                ➜ /about/work/mywork
```

You can effectively combine both modes within the same router configuration for maximum flexibility.
