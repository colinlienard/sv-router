# Routing Concepts

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
