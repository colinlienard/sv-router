---
outline: [2, 4]
---

# sv-router/vite-plugin

## Functions

### `router(options?)`

A Vite plugin that automatically generates route definitions from your file system structure.

**Parameters:**

- `options` - (Optional) Configuration object for the router plugin

**Returns:** A Vite plugin

## Types

### `RouterOptions`

Configuration options for the router Vite plugin.

**Properties:**

- `path` - (Optional) The path to the routes folder. Default: `'src/routes'`
- `js` - (Optional) If true, generates the routes in a .js file instead of a .ts file. Default: `false`
