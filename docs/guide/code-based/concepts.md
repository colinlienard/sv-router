# Routing Concepts

## Flat Mode or Tree Mode

When defining routes, you can choose between two organizational structures: flat or tree. Flat mode defines all routes at the router's root level, while tree mode organizes routes in a hierarchical structure.

```ts [router.ts]
// Flat Mode
'/about': About,
'/about/work': Work,
'/about/work/mywork': MyWork,
'/about/contact': Contact,

// Tree Mode
'/about': {
  '/': About,
  '/work': {
    '/': Work,
    '/mywork': MyWork,
  },
  '/contact': Contact,
},
```

You can effectively combine both modes within the same router configuration for maximum flexibility.
