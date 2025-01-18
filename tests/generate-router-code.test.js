import {
	buildFileTree,
	createRouteMap,
	createRouterCode,
	generateRouterCode,
} from '../src/gen/generate-router-code.js';

const readdirSync = vi.hoisted(() => vi.fn());
const lstatSync = vi.hoisted(() => vi.fn());
vi.mock('node:fs', () => ({ default: { readdirSync, lstatSync } }));

describe.each(['flat', 'tree'])('%s', (mode) => {
	beforeAll(() => {
		readdirSync.mockImplementation((dir) => {
			if (mode === 'flat') {
				return [
					'*.svelte',
					'about.svelte',
					'index.svelte',
					'posts.[id].svelte',
					'posts._layout.svelte',
					'posts.index.svelte',
					'posts.static.svelte',
					'posts.text.txt',
					'posts.noextension',
					'posts.comments.[id].svelte',
				];
			}
			if (dir.toString().endsWith('posts')) {
				return [
					'[id].svelte',
					'_layout.svelte',
					'index.svelte',
					'static.svelte',
					'text.txt',
					'noextension',
					'comments',
				];
			}
			if (dir.toString().endsWith('comments')) {
				return ['[id].svelte'];
			}
			return ['*.svelte', 'about.svelte', 'index.svelte', 'posts'];
		});

		lstatSync.mockImplementation((dir) => ({
			isDirectory() {
				if (mode === 'flat') return false;
				return dir.toString().endsWith('posts') || dir.toString().endsWith('comments');
			},
		}));
	});

	describe('generateRouterCode', () => {
		it('should generate the router code', () => {
			const result = generateRouterCode('./a/fake/path');
			expect(result).toBe(`import { createRouter } from "sv-router";

export const { path, goto, params } = createRouter({
  "*": () => import("../a/fake/path/*.svelte"),
  "/about": () => import("../a/fake/path/about.svelte"),
  "/": () => import("../a/fake/path/index.svelte"),
  "/posts": {
    "/:id": () => import("../a/fake/path/posts/[id].svelte"),
    "layout": () => import("../a/fake/path/posts/_layout.svelte"),
    "/": () => import("../a/fake/path/posts/index.svelte"),
    "/static": () => import("../a/fake/path/posts/static.svelte"),
    "/comments": {
      "/:id": () => import("../a/fake/path/posts/comments/[id].svelte"),
    }
  }
});`);
		});
	});

	describe('buildFileTree', () => {
		it('should get the file tree', () => {
			const result = buildFileTree('a/fake/path');
			expect(result).toEqual([
				'*.svelte',
				'about.svelte',
				'index.svelte',
				{
					name: 'posts',
					tree: [
						'[id].svelte',
						'_layout.svelte',
						'index.svelte',
						'static.svelte',
						{
							name: 'comments',
							tree: ['[id].svelte'],
						},
					],
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
					tree: [
						'index.svelte',
						'static.svelte',
						'[id].svelte',
						'_layout.svelte',
						{
							name: 'comments',
							tree: ['[id].svelte'],
						},
					],
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
					'/comments': {
						'/:id': 'posts/comments/[id].svelte',
					},
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
				'./routes',
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
});
