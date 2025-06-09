# Catch-All Routes

To handle any unmatched routes, define a catch-all route using the `*` symbol:

```ts
'*': NotFound,
```

You can optionally name the parameter, which allows you to access the unmatched part of the URL via `route.params` similar to dynamic routes:

```ts
'*notfound': NotFound,
```
