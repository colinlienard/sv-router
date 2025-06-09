# Catch-All Routes

To handle any unmatched routes, define a catch-all route using the spread syntax:

```sh
routes
└── [...notfound].svelte               ➜ /any-path
```

You can access the unmatched part of the URL via `route.params` (with the `notfound` key in this example) similar to dynamic routes.
