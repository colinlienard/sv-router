# Manual Setup

With file-based routing, routes are automatically generated based on your file structure.

Imagine you've created two route components in your `src/routes` directory:

```sh
src
└── routes
  ├── about.svelte
  └── index.svelte
```

> [!IMPORTANT]
> While file-based routing is primarily designed for Vite, you can also use it through the `sv-router` CLI.

## With Vite

After initializing a new Vite and Svelte project, add the sv-router plugin to your Vite configuration:

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

## With Another Bundler

In your `package.json`, create a script to generate routes:

```json [package.json]
{
	"scripts": {
		"gen-routes": "sv-router" // [!code ++]
	}
}
```

## Common Steps

To ensure routes are generated during installation in CI environments or for new contributors, add a `postinstall` script:

```json [package.json]
{
	"scripts": {
		"postinstall": "sv-router" // [!code ++]
	}
}
```

After running your installation command or starting the development server, a `.router` directory will be created containing the auto-generated routes mapping code and a `tsconfig.json` file.

Add the `.router` directory to your `.gitignore` file (you should probably also ignore it in Prettier, ESLint, Biome, etc):

```[.gitignore]
.router
```

Extend your project's TypeScript configuration from the generated one:

```json [tsconfig.json]
{
	"extends": ["./.router/tsconfig.json"]
}
```

> [!WARNING]
> If you're using path aliases in your `tsconfig.json`, they will override the `sv-router/generated` alias from the extended configuration. Make sure to include it in your own paths configuration:
>
> ```json [tsconfig.json]
> {
> 	"extends": ["./.router/tsconfig.json"],
> 	"compilerOptions": {
> 		"paths": {
> 			"your-path": ["./src/your-path"],
> 			"sv-router/generated": ["./.router/generated"] // [!code ++]
> 		}
> 	}
> }
> ```

In your application's entry point component, import and use the `Router` component, which handles rendering the active route:

```svelte [App.svelte]
<script lang="ts">
	import { Router } from 'sv-router';
	import 'sv-router/generated';
</script>

<a href="/">Home</a>
<a href="/about">About</a>

<Router />
```

You now have a functional navigation system. Continue reading to learn more about advanced routing concepts.
