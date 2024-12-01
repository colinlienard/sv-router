import { generateRouter, generateRoutes } from './generate-routes.ts';

describe('generateRoutes', () => {
	it('should generate routes', () => {
		expect(
			generateRoutes([
				'index.svelte',
				'about.svelte',
				{
					name: 'posts',
					tree: ['index.svelte', 'static.svelte', ':id.svelte'],
				},
				'*.svelte',
			]),
		).toEqual({
			'/': 'index.svelte',
			'/about': 'about.svelte',
			'/posts': {
				'/': 'posts/index.svelte',
				'/static': 'posts/static.svelte',
				'/:id': 'posts/:id.svelte',
			},
			'*': '*.svelte',
		});
	});
});

describe('generateRouter', () => {
	it('should generate the router', () => {
		expect(
			generateRouter(
				[
					'index.svelte',
					'about.svelte',
					{
						name: 'posts',
						tree: ['index.svelte', 'static.svelte', ':id.svelte'],
					},
					'*.svelte',
				],
				'./routes/',
			),
		).toBe(`import { createRouter } from "sv-router";

export const { path, goto, params } = createRouter({
  "/": () => import("./routes/index.svelte"),
  "/about": () => import("./routes/about.svelte"),
  "/posts": {
    "/": () => import("./routes/posts/index.svelte"),
    "/static": () => import("./routes/posts/static.svelte"),
    "/:id": () => import("./routes/posts/:id.svelte"),
  },
  "*": () => import("./routes/*.svelte"),
});`);
	});
});
