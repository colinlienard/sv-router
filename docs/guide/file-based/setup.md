# Setup

When using this method, a file will be generated based on your files structure.

Lets say that you have created two routes in your `src/routes` directory:

```sh
src
└── routes
  ├── about.svelte
  └── index.svelte
```

> [!IMPORTANT]
> File-based routing is primarly intended to use will Vite, though you can use it through the `sv-router` CLI.

## With Vite

After starting a fresh new Vite and Svelte project, you can add the Vite plugin in your config:

```ts [vite.config.ts]
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { router } from 'sv-router/vite-plugin'; // [!code ++]

export default defineConfig({
	plugins: [
		svelte(),
		router(), // [!code ++]
	],
});
```

## With another bundler

In your `package.json`, add a script to generate the routes.

```json [package.json]
{
	"scripts": {
		"gen-routes": "sv-router" // [!code ++]
	}
}
```

## Common steps

You can also add a `postinstall` script in your `package.json` to generate the routes in CI or when welcoming new contributors:

```json [package.json]
{
	"scripts": {
		"postinstall": "sv-router" // [!code ++]
	}
}
```

Then run your install command or start the dev server, and a `.router` directory will be created with a TypeScript file containing the auto-generated routes mapping code, and a `tsconfig.json` file.

You can ignore the `.router` directory in your `.gitignore` file.

```[.gitignore]
.router
```

Then you should extends your tsconfig from the generated one:

```json [tsconfig.json]
{
	"extends": ["./.router/tsconfig.json"]
}
```

In the entrypoint component of your app, you should then import and use the `Router` component - it will take care of rendering the correct route.

You can also add links to navigate between the routes. You should now have an app with working navigation!

```svelte [App.svelte]
<script lang="ts">
	import { Router } from 'sv-router';
</script>

<a href="/">Home</a>
<a href="/about">About</a>

<Router />
```

You can now learn more about the routing concepts.
