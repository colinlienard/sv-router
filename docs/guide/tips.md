# Tips

## Head Management

To manage the `<head>` section of your HTML document, use Svelte's native `<svelte:head>` element. This allows you to dynamically set metadata such as the page title and meta tags for each route. See the [Svelte documentation](https://svelte.dev/docs/svelte/svelte-head).

```svelte [about.svelte]
<svelte:head>
	<title>About</title>
	<meta name="description" content="..." />
</svelte:head>
```

## Error Boundaries

To catch and handle errors in your application, use Svelte's native `<svelte:boundary>` element. This allows you to define error boundaries and display fallback UI when errors occur for each route. See the [Svelte documentation](https://svelte.dev/docs/svelte/svelte-boundary).

## SPA Deployment

When deploying a Single Page Application, ensure your web server is configured to handle client-side routing:

- Platforms like **Vercel** and **Cloudflare Pages** natively support SPAs and require no additional configuration.
- For **Netlify**, see the [official documentation on redirects for SPAs](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/#history-pushstate-and-single-page-apps).
- For **Nginx**, use the `try_files` directive to serve `index.html` for all routes.
- For **Apache**, use the `FallbackResource /index.html` directive to redirect all requests to `index.html`.
- For **AWS Amplify**, see the [official documentation on redirects for SPAs](https://docs.aws.amazon.com/amplify/latest/userguide/redirects.html#redirects-for-single-page-web-apps-spa).
- For **Azure**, see the [official documentation on route configuration](https://docs.microsoft.com/en-us/azure/static-web-apps/routes).
