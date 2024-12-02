import path from 'node:path';
import {
	buildFileTree,
	createRouteMap,
	createRouterCode,
	generateRouterCode,
} from './generate-router-code.ts';

describe('generateRouterCode', () => {
	it('should generate the router code', () => {
		const result = generateRouterCode('./examples/file-based/src/routes');
		expect(result).toBe(`import { createRouter } from "sv-router";

export const { path, goto, params } = createRouter({
  "*": () => import("./examples/file-based/src/routes*.svelte"),
  "/about": () => import("./examples/file-based/src/routesabout.svelte"),
  "/": () => import("./examples/file-based/src/routesindex.svelte"),
  "/posts": {
    "/:id": () => import("./examples/file-based/src/routesposts/[id].svelte"),
    "layout": () => import("./examples/file-based/src/routesposts/_layout.svelte"),
    "/": () => import("./examples/file-based/src/routesposts/index.svelte"),
    "/static": () => import("./examples/file-based/src/routesposts/static.svelte"),
  }
});`);
	});
});

describe('buildFileTree', () => {
	it('should get the file tree', () => {
		const result = buildFileTree(path.join(process.cwd(), 'examples/file-based/src/routes'));
		expect(result).toEqual([
			'*.svelte',
			'about.svelte',
			'index.svelte',
			{
				name: 'posts',
				tree: ['[id].svelte', '_layout.svelte', 'index.svelte', 'static.svelte'],
			},
		]);
	});
});

describe('createRouteMap', () => {
	it('should generate routes', () => {
		const result = createRouteMap([
			'index.svelte',
			'about.svelte',
			{
				name: 'posts',
				tree: ['index.svelte', 'static.svelte', '[id].svelte', '_layout.svelte'],
			},
			'*.svelte',
		]);
		expect(result).toEqual({
			'/': 'index.svelte',
			'/about': 'about.svelte',
			'/posts': {
				'/': 'posts/index.svelte',
				'/static': 'posts/static.svelte',
				'/:id': 'posts/[id].svelte',
				layout: 'posts/_layout.svelte',
			},
			'*': '*.svelte',
		});
	});
});

describe('createRouterCode', () => {
	it('should generate the router', () => {
		const result = createRouterCode(
			{
				'/': 'index.svelte',
				'/about': 'about.svelte',
				'/posts': {
					'/': 'posts/index.svelte',
					'/static': 'posts/static.svelte',
					'/:id': 'posts/:id.svelte',
				},
				'*': '*.svelte',
			},
			'./routes/',
		);
		expect(result).toBe(`import { createRouter } from "sv-router";

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
