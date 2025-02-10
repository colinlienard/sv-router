---
outline: [2, 3]
---

# Configuration

## How to configure

To configure the Vite plugin, you can pass an object to the `router()` function in your Vite config file:

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

You should also pass the options to the CLI that you hopefully use in your postinstall script:

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

The path to the directory containing the route files.

### `js`

| Type      | Default          | Required |
| --------- | ---------------- | -------- |
| `boolean` | <pre>false</pre> | No       |

If set to `true`, generate a `.js` file instead of a `.ts` file.
