---
outline: [2, 4]
---

# sv-router

## Functions

### `createRouter(routes)`

Sets up a new router instance with the given routes configuration.

**Parameters:**

- `routes` - An object mapping paths to components or nested routes

**Returns:** A router API object with the following properties:

- [`p`](#p-path-params) - Path constructor
- [`navigate`](#navigate-path-options) - Navigation function
- [`isActive`](#isactive-path-params) - Route activation checker
- [`preload`](#preload-path) - Preload route components
- [`route`](#route) - Current route information

#### `p(path, params?)`

Constructs a path with type-safe parameter substitution.

**Parameters:**

- `path` - The route path
- `params` - (Optional) Parameters to substitute in the path

**Returns:** A string representing the constructed path

#### `navigate(path, options?)`

Programmatically navigate to a route.

**Parameters:**

- `path | number` - Either:
  - A string path to navigate to, or
  - A number representing steps to navigate in history (negative for back, positive for forward)
- `options` - (Optional) Navigation options
  - `replace` - Replace current history entry instead of pushing
  - `search` - Query string
  - `state` - History state to save
  - `hash` - URL hash fragment
  - `scrollToTop` - Scroll behavior (`"auto" | "instant" | "smooth" | false`)
  - `viewTransition` - Enable view transition (`boolean`)
  - `params` - Parameters to substitute in the path

#### `isActive(path, params?)`

Checks if a given path is currently active.

**Parameters:**

- `path` - The route to check
- `params` - (Optional) Parameters to substitute in the path

**Returns:** Boolean indicating if the route is active

**Methods:**

- `startsWith(path: string, params?: Record<string, string | number>): boolean` - Returns true if the current route starts with the given path and parameters.

#### `preload(path)`

Preload route components.

**Parameters:**

- `path` - The route to preload

**Returns:** Promise that resolves when the route components are preloaded

#### `route`

An object containing information about the current route.

**Properties:**

- `params` - Non-strict parameters from the current route
- `getParams(pathname: string)` - Strict parameters from the current route
- `pathname` - Current path
- `search` - Query string portion of the URL
- `state` - History state
- `hash` - Hash fragment of the URL

### `isActiveLink`

A Svelte action that adds a class to anchors when their `href` matches the current route.

**Parameters:**

- `options` - (Optional) Configuration object
  - `className` - The class to add when active (defaults to `is-active`)
  - `startsWith` - Whether to match the start of the path (defaults to `false`)

## Components

### `<Router />`

The component that renders the current route.

This component will automatically render the component that matches the current URL path. It uses the routes configuration provided to `createRouter()` to determine which component to render.

## Variables

### `searchParams`

A reactive URL search parameters object that updates the URL when changed.

**Properties and Methods:**

- All standard [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) methods (`get`, `set`, `has`, `delete`, etc.)
  - `options` - (Optional) For `append`, `delete`, `set` and `sort`
    - `replace` - Wheter to create a new entry in the history stack (defaults to `false`)

## Types

### `Hooks`

Configuration object for route lifecycle hooks.

**Properties:**

- `beforeLoad?(): void | Promise<void>` - A function called before the route is loaded. You can throw a `navigate` call to redirect.
- `afterLoad?(): void` - A function called after the route is loaded.
- `onPreload?(): void` - A function called when the route is preloaded.
