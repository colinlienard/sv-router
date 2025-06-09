---
outline: [2, 3]
---

# Getting Started

## Start a New Project

To kickstart a new project with sv-router, run the following command using your preferred package manager:

::: code-group

```sh [npm]
npm create sv-router@latest
```

```sh [pnpm]
pnpm create sv-router
```

```sh [yarn]
yarn create sv-router
```

```sh [bun]
bun create sv-router
```

```sh [deno]
deno run -A npm:create-sv-router@latest
```

:::

After setting up your project, you can use the [`sv` CLI](https://svelte.dev/docs/cli/sv-add) to automatically configure tools like ESLint and Prettier.

Then, dive into the routing concepts:

- [For code-based routing](./code-based/route-definition)
- [For file-based routing](./file-based/route-definition)

## Install on an Existing Project

> [!IMPORTANT]
> sv-router requires Svelte 5 to function properly.

Install the package using your preferred package manager:

::: code-group

```sh [npm]
npm install sv-router
```

```sh [pnpm]
pnpm add sv-router
```

```sh [yarn]
yarn add sv-router
```

```sh [bun]
bun add sv-router
```

```sh [deno]
deno add npm:sv-router
```

:::

Then, choose between two routing approaches:

- **Code-based routing**: Offers greater control over your file architecture but requires manual route definition. [Set up code-based routing here](./code-based/manual-setup).
- **File-based routing**: Automatically generates route mappings based on a specific file structure. [Set up file-based routing here](./file-based/manual-setup).
