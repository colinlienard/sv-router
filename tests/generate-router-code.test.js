import {
	buildFileTree,
	createRouteMap,
	createRouterCode,
	generateRouterCode,
	pathToCorrectCasing,
} from '../src/gen/generate-router-code.js';

const readdirSync = vi.hoisted(() => vi.fn());
const lstatSync = vi.hoisted(() => vi.fn());
vi.mock('node:fs', () => ({ default: { readdirSync, lstatSync, existsSync: () => true } }));

describe('generateRouterCode', () => {
	it('should generate the router code (flat)', () => {
		mockFlatMode();
		const result = generateRouterCode('./a/fake/path');
		expect(result).toBe(`import { createRouter } from 'sv-router';
import About from '../a/fake/path/about.svelte';
import Index from '../a/fake/path/index.svelte';
import PostsStatic from '../a/fake/path/posts.static.svelte';
import PostsNolayout from '../a/fake/path/posts.(nolayout).svelte';

export const { p, navigate, isActive, route } = createRouter({
  '*notfound': () => import('../a/fake/path/[...notfound].lazy.svelte'),
  '/about': About,
  '/': Index,
  '/posts/:id': () => import('../a/fake/path/posts.[id].lazy.svelte'),
  '/posts': () => import('../a/fake/path/posts.index.lazy.svelte'),
  '/posts/static': PostsStatic,
  '/posts/(nolayout)': PostsNolayout,
  '/posts/comments/:id': () => import('../a/fake/path/posts.comments.[id].lazy.svelte')
});`);
	});

	it('should generate the router code (tree)', () => {
		mockTreeMode();
		const result = generateRouterCode('./a/fake/path');
		expect(result).toBe(`import { createRouter } from 'sv-router';
import About from '../a/fake/path/about.svelte';
import Index from '../a/fake/path/index.svelte';
import PostsLayout from '../a/fake/path/posts/layout.svelte';
import PostsStatic from '../a/fake/path/posts/static.svelte';
import PostsNolayout from '../a/fake/path/posts/(nolayout).svelte';
import postsHooks from '../a/fake/path/posts/hooks';
import postsCommentsHooks from '../a/fake/path/posts/comments/hooks.svelte';

export const { p, navigate, isActive, route } = createRouter({
  '*notfound': () => import('../a/fake/path/[...notfound].lazy.svelte'),
  '/about': About,
  '/': Index,
  '/posts': {
    '/:id': () => import('../a/fake/path/posts/[id].lazy.svelte'),
    'layout': PostsLayout,
    '/': () => import('../a/fake/path/posts/index.lazy.svelte'),
    '/static': PostsStatic,
    '/(nolayout)': PostsNolayout,
    'hooks': postsHooks,
    '/comments': {
      '/:id': () => import('../a/fake/path/posts/comments/[id].lazy.svelte'),
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
			'[...notfound].lazy.svelte',
			'about.svelte',
			'index.svelte',
			'posts.[id].lazy.svelte',
			'posts.index.lazy.svelte',
			'posts.static.svelte',
			'posts.(nolayout).svelte',
			'posts.comments.[id].lazy.svelte',
		]);
	});

	it('should get the file tree (tree)', () => {
		mockTreeMode();
		const result = buildFileTree('a/fake/path');
		expect(result).toEqual([
			'[...notfound].lazy.svelte',
			'about.svelte',
			'index.svelte',
			{
				name: 'posts',
				tree: [
					'[id].lazy.svelte',
					'layout.svelte',
					'index.lazy.svelte',
					'static.svelte',
					'(nolayout).svelte',
					'hooks.ts',
					{
						name: 'comments',
						tree: ['[id].lazy.svelte', 'hooks.svelte.ts'],
					},
				],
			},
		]);
	});
});

describe('createRouteMap', () => {
	it('should generate routes (flat)', () => {
		const result = createRouteMap([
			'[...notfound].lazy.svelte',
			'about.svelte',
			'index.svelte',
			'posts.[id].svelte',
			'posts.index.lazy.svelte',
			'posts.static.svelte',
			'posts.(nolayout).svelte',
			'posts.([nolayoutparam]).svelte',
			'posts.comments.[id].lazy.svelte',
			'posts.comments.([...notfound]).svelte',
		]);
		expect(result).toEqual({
			'*notfound': '[...notfound].lazy.svelte',
			'/': 'index.svelte',
			'/about': 'about.svelte',
			'/posts/:id': 'posts.[id].svelte',
			'/posts': 'posts.index.lazy.svelte',
			'/posts/static': 'posts.static.svelte',
			'/posts/(nolayout)': 'posts.(nolayout).svelte',
			'/posts/(:nolayoutparam)': 'posts.([nolayoutparam]).svelte',
			'/posts/comments/:id': 'posts.comments.[id].lazy.svelte',
			'/posts/comments/(*notfound)': 'posts.comments.([...notfound]).svelte',
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
					'(nolayout).svelte',
					'[id].svelte',
					'([nolayoutparam]).svelte',
					'layout.svelte',
					'hooks.ts',
					{
						name: 'comments',
						tree: ['[id].lazy.svelte', '([...notfound]).svelte', 'hooks.svelte.ts'],
					},
				],
			},
			'[...notfound].lazy.svelte',
		]);
		expect(result).toEqual({
			'/': 'index.svelte',
			'/about': 'about.svelte',
			'/posts': {
				'/': 'posts/index.lazy.svelte',
				'/static': 'posts/static.svelte',
				'/(nolayout)': 'posts/(nolayout).svelte',
				'/:id': 'posts/[id].svelte',
				'/(:nolayoutparam)': 'posts/([nolayoutparam]).svelte',
				layout: 'posts/layout.svelte',
				hooks: 'posts/hooks.ts',
				'/comments': {
					'/:id': 'posts/comments/[id].lazy.svelte',
					'(*notfound)': 'posts/comments/([...notfound]).svelte',
					hooks: 'posts/comments/hooks.svelte.ts',
				},
			},
			'*notfound': '[...notfound].lazy.svelte',
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
					'/(nolayout)': 'posts/(nolayout).svelte',
					'/:id': 'posts/[id].lazy.svelte',
					hooks: 'posts/hooks.ts',
					'/comments': {
						'/:commentId': 'posts/comments/[commentId].svelte',
						hooks: 'posts/comments/hooks.svelte.ts',
					},
				},
				'*notfound': '[...notfound].lazy.svelte',
			},
			'./routes',
		);
		expect(result).toBe(`import { createRouter } from 'sv-router';
import Index from './routes/index.svelte';
import About from './routes/about.svelte';
import PostsStatic from './routes/posts/static.svelte';
import PostsNolayout from './routes/posts/(nolayout).svelte';
import postsHooks from './routes/posts/hooks';
import PostsCommentsCommentId from './routes/posts/comments/[commentId].svelte';
import postsCommentsHooks from './routes/posts/comments/hooks.svelte';

export const { p, navigate, isActive, route } = createRouter({
  '/': Index,
  '/about': About,
  '/posts': {
    '/': () => import('./routes/posts/index.lazy.svelte'),
    '/static': PostsStatic,
    '/(nolayout)': PostsNolayout,
    '/:id': () => import('./routes/posts/[id].lazy.svelte'),
    'hooks': postsHooks,
    '/comments': {
      '/:commentId': PostsCommentsCommentId,
      'hooks': postsCommentsHooks
    }
  },
  '*notfound': () => import('./routes/[...notfound].lazy.svelte')
});`);
	});
});

describe('pathToCorrectCasing', () => {
	it('should handle paths with only one segment', () => {
		const result = pathToCorrectCasing('about.svelte');
		expect(result).toBe('About');
	});

	it('should convert a path with multiple segments to camelCase', () => {
		const result = pathToCorrectCasing('simple/path/about.svelte');
		expect(result).toBe('SimplePathAbout');
	});

	it('should handle paths with dashes correctly', () => {
		const result = pathToCorrectCasing('this-is/a-test/path/about-me.svelte');
		expect(result).toBe('ThisIsATestPathAboutMe');
	});

	it('should handle lazy paths correctly', () => {
		const result = pathToCorrectCasing('posts/about.lazy.svelte');
		expect(result).toBe('PostsAbout');
	});

	it('should handle paths with a param correctly', () => {
		const result = pathToCorrectCasing('posts/[id].svelte');
		expect(result).toBe('PostsId');
	});

	it('should handle catch-all paths correctly', () => {
		const result = pathToCorrectCasing('posts/[...notfound].svelte');
		expect(result).toBe('PostsNotfound');
	});

	it('should handle paths with no layout', () => {
		const result = pathToCorrectCasing('posts/(nolayout).svelte');
		expect(result).toBe('PostsNolayout');
	});

	it('should handle paths with hooks', () => {
		const result = pathToCorrectCasing('posts/hooks.svelte.ts');
		expect(result).toBe('postsHooks');
	});

	it('should handle flat paths', () => {
		const result1 = pathToCorrectCasing('simple.path.about.svelte');
		expect(result1).toBe('SimplePathAbout');

		const result2 = pathToCorrectCasing('posts.[...notfound].svelte');
		expect(result2).toBe('PostsNotfound');

		const result3 = pathToCorrectCasing('posts.[...notfound].svelte');
		expect(result3).toBe('PostsNotfound');

		const result4 = pathToCorrectCasing('posts.hooks.ts');
		expect(result4).toBe('postsHooks');
	});
});

function mockFlatMode() {
	readdirSync.mockImplementation(() => [
		'[...notfound].lazy.svelte',
		'about.svelte',
		'index.svelte',
		'posts.[id].lazy.svelte',
		'posts.index.lazy.svelte',
		'posts.static.svelte',
		'posts.(nolayout).svelte',
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
				'(nolayout).svelte',
				'hooks.ts',
				'text.txt',
				'noextension',
				'comments',
			];
		}
		if (dir.toString().endsWith('comments')) {
			return ['[id].lazy.svelte', 'hooks.svelte.ts'];
		}
		return ['[...notfound].lazy.svelte', 'about.svelte', 'index.svelte', 'posts'];
	});
	lstatSync.mockImplementation((dir) => ({
		isDirectory() {
			return dir.toString().endsWith('posts') || dir.toString().endsWith('comments');
		},
	}));
}
