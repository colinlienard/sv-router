import {
	buildFileTree,
	createRouteMap,
	createRouterCode,
	generateRouterCode,
	hooksPathToCamelCase,
} from '../src/gen/generate-router-code.js';

const readdirSync = vi.hoisted(() => vi.fn());
const lstatSync = vi.hoisted(() => vi.fn());
vi.mock('node:fs', () => ({ default: { readdirSync, lstatSync } }));

describe('generateRouterCode', () => {
	it('should generate the router code (flat)', () => {
		mockFlatMode();
		const result = generateRouterCode('./a/fake/path');
		expect(result).toBe(`import { createRouter } from 'sv-router';

export const { p, navigate, isActive, route } = createRouter({
  '*slug': () => import('../a/fake/path/[...slug].svelte'),
  '/about': () => import('../a/fake/path/about.svelte'),
  '/': () => import('../a/fake/path/index.svelte'),
  '/posts/:id': () => import('../a/fake/path/posts.[id].svelte'),
  '/posts': () => import('../a/fake/path/posts.index.svelte'),
  '/posts/static': () => import('../a/fake/path/posts.static.svelte'),
  '/posts/comments/:id': () => import('../a/fake/path/posts.comments.[id].svelte')
});`);
	});

	it('should generate the router code (tree)', () => {
		mockTreeMode();
		const result = generateRouterCode('./a/fake/path');
		expect(result).toBe(`import { createRouter } from 'sv-router';
import postsHooks from '../a/fake/path/posts/hooks';
import postsCommentsHooks from '../a/fake/path/posts/comments/hooks.svelte';

export const { p, navigate, isActive, route } = createRouter({
  '*slug': () => import('../a/fake/path/[...slug].svelte'),
  '/about': () => import('../a/fake/path/about.svelte'),
  '/': () => import('../a/fake/path/index.svelte'),
  '/posts': {
    '/:id': () => import('../a/fake/path/posts/[id].svelte'),
    'layout': () => import('../a/fake/path/posts/layout.svelte'),
    '/': () => import('../a/fake/path/posts/index.svelte'),
    '/static': () => import('../a/fake/path/posts/static.svelte'),
    'hooks': postsHooks,
    '/comments': {
      '/:id': () => import('../a/fake/path/posts/comments/[id].svelte'),
      'hooks': postsCommentsHooks
    }
  }
});`);
	});
});

describe('buildFileTree', () => {
	it('should get the file tree (flat)', () => {
		mockFlatMode();
		const result = buildFileTree('a/fake/path');
		expect(result).toEqual([
			'[...slug].svelte',
			'about.svelte',
			'index.svelte',
			'posts.[id].svelte',
			'posts.index.svelte',
			'posts.static.svelte',
			'posts.comments.[id].svelte',
		]);
	});

	it('should get the file tree (tree)', () => {
		mockTreeMode();
		const result = buildFileTree('a/fake/path');
		expect(result).toEqual([
			'[...slug].svelte',
			'about.svelte',
			'index.svelte',
			{
				name: 'posts',
				tree: [
					'[id].svelte',
					'layout.svelte',
					'index.svelte',
					'static.svelte',
					'hooks.ts',
					{
						name: 'comments',
						tree: ['[id].svelte', 'hooks.svelte.ts'],
					},
				],
			},
		]);
	});
});

describe.only('createRouteMap', () => {
	it('should generate routes (flat)', () => {
		const result = createRouteMap([
			'[...slug].lazy.svelte',
			'about.svelte',
			'index.svelte',
			'posts.[id].lazy.svelte',
			'posts.index.lazy.svelte',
			'posts.static.svelte',
			'posts.comments.[id].lazy.svelte',
		]);
		expect(result).toEqual({
			'*slug': '[...slug].lazy.svelte',
			'/': 'index.svelte',
			'/about': 'about.svelte',
			'/posts/:id': 'posts.[id].lazy.svelte',
			'/posts/comments/:id': 'posts.comments.[id].lazy.svelte',
			'/posts': 'posts.index.lazy.svelte',
			'/posts/static': 'posts.static.svelte',
		});
	});

	it('should generate routes (tree)', () => {
		const result = createRouteMap([
			'index.svelte',
			'about.svelte',
			{
				name: 'posts',
				tree: [
					'index.lazy.svelte',
					'static.svelte',
					'[id].lazy.svelte',
					'layout.svelte',
					'hooks.ts',
					{
						name: 'comments',
						tree: ['[id].lazy.svelte', 'hooks.svelte.ts'],
					},
				],
			},
			'[...slug].lazy.svelte',
		]);
		expect(result).toEqual({
			'/': 'index.svelte',
			'/about': 'about.svelte',
			'/posts': {
				'/': 'posts/index.lazy.svelte',
				'/static': 'posts/static.svelte',
				'/:id': 'posts/[id].lazy.svelte',
				layout: 'posts/layout.svelte',
				hooks: 'posts/hooks.ts',
				'/comments': {
					'/:id': 'posts/comments/[id].lazy.svelte',
					hooks: 'posts/comments/hooks.svelte.ts',
				},
			},
			'*slug': '[...slug].lazy.svelte',
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
					'/': 'posts/index.lazy.svelte',
					'/static': 'posts/static.svelte',
					'/:id': 'posts/[id].lazy.svelte',
					hooks: 'posts/hooks.ts',
				},
				'*slug': '[...slug].lazy.svelte',
			},
			'./routes',
		);
		expect(result).toBe(`import { createRouter } from 'sv-router';
import Index from './routes/index.svelte';
import About from './routes/about.svelte';
import PostsStatic from './routes/posts/static.svelte';
import postsHooks from './routes/posts/hooks';

export const { p, navigate, isActive, route } = createRouter({
  '/': Index,
  '/about': About,
  '/posts': {
    '/': () => import('./routes/posts/index.lazy.svelte'),
    '/static': PostsStatic,
    '/:id': () => import('./routes/posts/[id].lazy.svelte'),
    'hooks': postsHooks
  },
  '*slug': () => import('./routes/[...slug].lazy.svelte')
});`);
	});
});

describe('hooksPathToCamelCase', () => {
	it('should handle paths with only one segment', () => {
		const result = hooksPathToCamelCase('about.svelte');
		expect(result).toBe('about');
	});

	it('should convert a path with multiple segments to camelCase', () => {
		const result = hooksPathToCamelCase('simple/path/about.svelte');
		expect(result).toBe('simplePathAbout');
	});

	it('should handle paths with dashes correctly', () => {
		const result = hooksPathToCamelCase('this-is/a-test/path/hooks.ts');
		expect(result).toBe('thisIsATestPathHooks');
	});

	it('should handle paths with hooks', () => {
		const result = hooksPathToCamelCase('posts/hooks.svelte.ts');
		expect(result).toBe('postsHooks');
	});
});

function mockFlatMode() {
	readdirSync.mockImplementation(() => [
		'[...slug].lazy.svelte',
		'about.svelte',
		'index.svelte',
		'posts.[id].lazy.svelte',
		'posts.index.lazy.svelte',
		'posts.static.svelte',
		'posts.text.txt',
		'posts.noextension',
		'posts.comments.[id].lazy.svelte',
	]);
	lstatSync.mockImplementation(() => ({
		isDirectory: () => false,
	}));
}

function mockTreeMode() {
	readdirSync.mockImplementation((dir) => {
		if (dir.toString().endsWith('posts')) {
			return [
				'[id].lazy.svelte',
				'layout.svelte',
				'index.lazy.svelte',
				'static.svelte',
				'hooks.ts',
				'text.txt',
				'noextension',
				'comments',
			];
		}
		if (dir.toString().endsWith('comments')) {
			return ['[id].lazy.svelte', 'hooks.svelte.ts'];
		}
		return ['[...slug].lazy.svelte', 'about.svelte', 'index.svelte', 'posts'];
	});
	lstatSync.mockImplementation((dir) => ({
		isDirectory() {
			return dir.toString().endsWith('posts') || dir.toString().endsWith('comments');
		},
	}));
}
