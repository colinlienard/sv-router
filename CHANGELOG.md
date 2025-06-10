# sv-router

## 0.6.0

### Minor Changes

- 894ec78: Add route metadata
- 32a4037: Add route.getParams method for a stricter way to access params

### Patch Changes

- bf7036d: Make route matching case-insensitive

## 0.5.0

### Minor Changes

- 20f5b50: Add a function to programmatically preload routes
- 2946378: Add onPreload hook

### Patch Changes

- 90a66e4: Better typing for route.pathname

## 0.4.0

### Minor Changes

- b79846a: Add support for view transitions
- 4dd5892: Cancel pending navigation if new one is started

### Patch Changes

- ed442a3: Fix vite plugin config change during development

## 0.3.0

### Minor Changes

- 43f8e33: Add an option to lazy load all routes by default in file-based routing

### Patch Changes

- 22db6cb: Add typesafe pathname
- 2673cd9: Fix layout not rendered with catch-all routes

## 0.2.0

### Minor Changes

- 02a7f27: Add support for basename

## 0.1.0

### Minor Changes

- 31a8a2d: Replace option for search params

### Patch Changes

- 4740b1c: Scroll behavior features
- 9b79e89: Fix filenames regexes in router code generation by not allowing characters before the match

## 0.0.8

### Patch Changes

- 44d259e: Improve error experience when no routes directory
- a6ebcf9: Fix routes generation on windows
- f995375: Break out of layouts in file-based
- 20883a0: Add isActive.startsWith function

## 0.0.7

### Patch Changes

- 3a233a1: Improve navigate traversing api
- b138b04: Specify which routes to lazy load in file-based routing
- 94e608f: Add route hooks

## 0.0.6

### Patch Changes

- b5da6da: Add back and forward navigate methods
- 4ef06c5: Add support for params in catch-all routes
- 99b437f: Add isActive function
- 53c73ca: Add reactive url search params

## 0.0.5

### Patch Changes

- 9c1ed5d: Add support for file-based routing flat mode
- 8f3ede2: API improvements
- b2a50f6: Add an option to generate routes in a .js file instead of .ts
- 7fa131f: Add link preloading

## 0.0.4

### Patch Changes

- 779cae7: Support path option in the cli
- d3a5c5f: Add a baseUrl in the generated tsconfig

## 0.0.3

### Patch Changes

- b330ebf: Switch from TS to JSDoc
- 8e63e78: Opt out of layouts
- 40528f4: Add a path option to the vite plugin
