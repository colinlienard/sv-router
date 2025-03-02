---
outline: [2, 3]
---

# Configuration

## How to Configure

Configure the Vite plugin by passing an options object to the `router()` function in your Vite configuration:

```ts{4-6} [vite.config.ts]
export default defineConfig({
	plugins: [
		svelte(),
		router({
			path: 'src/pages',
		}),
	],
});
```

Apply the same options to the CLI in your `postinstall` script:

```json [package.json]
{
	"scripts": {
		"postinstall": "sv-router --path src/pages"
	}
}
```

## Options

### `path`

| Type     | Default               | Required |
| -------- | --------------------- | -------- |
| `string` | <pre>src/routes</pre> | No       |

Specifies the directory containing your route files.

### `js`

| Type      | Default          | Required |
| --------- | ---------------- | -------- |
| `boolean` | <pre>false</pre> | No       |

When set to `true`, generates a `.js` file instead of a `.ts` file.
