---
outline: [2, 3]
---

# Configuration

## How to Configure

Configure the Vite plugin by passing an options object to the `router()` function in your Vite configuration:

```ts{1,6-8} [vite.config.ts]
import { router } from 'sv-router/vite-plugin';

export default defineConfig({
	plugins: [
		svelte(),
		router({
			path: 'src/pages',
		}),
	],
});
```

The CLI automatically reads options from your Vite config, so you only need to define them once. If you're not using Vite or the config can't be read, pass the options directly to the CLI:

```json [package.json]
{
	"scripts": {
		"postinstall": "sv-router --path src/pages"
	}
}
```

> [!NOTE]
> CLI arguments override all Vite config options.

## Options

### `allLazy`

| Type      | Default          | Required |
| --------- | ---------------- | -------- |
| `boolean` | <pre>false</pre> | No       |

When set to `true`, all routes will be lazy loaded by default.

### `ignore`

| Type       | Default       | Required |
| ---------- | ------------- | -------- |
| `RegExp[]` | <pre>[]</pre> | No       |

An array of regular expressions for files to ignore when generating routes.

For example, if you want to have Svelte components in your routes directory but don't want them to become routes, you can ignore files that start with a capital letter:

```ts
router({ ignore: [/[A-Z].*\.svelte$/] )}
```

Similarly for the `postinstall` script:

```json
"postinstall": "sv-router --ignore '[A-Z].*\\.svelte$'" // You can have multiple ones separated by commas
```

### `js`

| Type      | Default          | Required |
| --------- | ---------------- | -------- |
| `boolean` | <pre>false</pre> | No       |

When set to `true`, generates a `.js` file instead of a `.ts` file.

### `path`

| Type     | Default               | Required |
| -------- | --------------------- | -------- |
| `string` | <pre>src/routes</pre> | No       |

Specifies the directory containing your route files.
