import type { Component } from 'svelte';
import type { Routes } from '../types/types.ts';
import { matchRoute, sortRoutes } from './match-route.ts';

const Home = (() => 'Home') as Component;
const Posts = (() => 'Posts') as Component;
const StaticPost = (() => 'StaticPost') as Component;
const DynamicPost = (() => 'DynamicPost') as Component;
const DynamicPostComment = (() => 'DynamicPostComment') as Component;
const UserNotFound = (() => 'UserNotFound') as Component;
const PageNotFound = (() => 'PageNotFound') as Component;
const Layout1 = (() => 'Layout1') as Component;
const Layout2 = (() => 'Layout2') as Component;

describe('matchRoute', () => {
	describe.each([
		{
			mode: 'flat',
			routes: {
				'/': Home,
				'/posts': Posts,
				'/posts/static': StaticPost,
				'/posts/:id': DynamicPost,
				'/posts/:id/:commentId': DynamicPostComment,
				'/users/*': UserNotFound,
				'*': PageNotFound,
			} satisfies Routes,
		},
		{
			mode: 'flat unordered',
			routes: {
				'/posts/:id/:commentId': DynamicPostComment,
				'/posts': Posts,
				'/users/*': UserNotFound,
				'/posts/static': StaticPost,
				'*': PageNotFound,
				'/posts/:id': DynamicPost,
				'/': Home,
			} satisfies Routes,
		},
		{
			mode: 'tree',
			routes: {
				'/': Home,
				'/posts': {
					'/': Posts,
					'/static': StaticPost,
					'/:id': {
						'/': DynamicPost,
						'/:commentId': DynamicPostComment,
						layout: Layout2,
					},
					layout: Layout1,
				},
				'/users': {
					'*': UserNotFound,
					layout: Layout1,
				},
				'*': PageNotFound,
			} satisfies Routes,
		},
		{
			mode: 'tree unordered',
			routes: {
				'*': PageNotFound,
				'/posts': {
					'/:id': {
						'/:commentId': DynamicPostComment,
						'/': DynamicPost,
						layout: Layout2,
					},
					'/': Posts,
					'/static': StaticPost,
					layout: Layout1,
				},
				'/users': {
					'*': UserNotFound,
					layout: Layout1,
				},
				'/': Home,
			} satisfies Routes,
		},
	])('$mode paths', ({ mode, routes: r }) => {
		const routes = r as unknown as Routes;
		const treeMode = mode.startsWith('tree');

		it('should match the root route', () => {
			const { match } = matchRoute('/', routes);
			expect(match).toEqual(Home);
		});

		it('should match a simple route', () => {
			const { match } = matchRoute('/posts', routes);
			expect(match).toEqual(Posts);
		});

		it('should match a simple route with a trailing slash', () => {
			const { match } = matchRoute('/posts', routes);
			expect(match).toEqual(Posts);
		});

		it('should match a nested route', () => {
			const { match } = matchRoute('/posts/static', routes);
			expect(match).toEqual(StaticPost);
		});

		it('should match a dynamic route and return a param', () => {
			const { match, params } = matchRoute('/posts/bar', routes);
			expect(match).toEqual(DynamicPost);
			expect(params).toEqual({ id: 'bar' });
		});

		it('should match multiple dynamic nested routes and return params', () => {
			const { match, params } = matchRoute('/posts/bar/baz', routes);
			expect(match).toEqual(DynamicPostComment);
			expect(params).toEqual({ id: 'bar', commentId: 'baz' });
		});

		if (treeMode) {
			it('should match routes with layout', () => {
				const { layouts: layouts1 } = matchRoute('/', routes);
				const { layouts: layouts2 } = matchRoute('/posts', routes);
				const { layouts: layouts3 } = matchRoute('/posts/static', routes);
				const { layouts: layouts4 } = matchRoute('/posts/bar/baz', routes);
				expect(layouts1).toEqual([]);
				expect(layouts2).toEqual([Layout1]);
				expect(layouts3).toEqual([Layout1]);
				expect(layouts4).toEqual([Layout1, Layout2]);
			});

			it('should also find root layout', () => {
				routes['layout'] = Layout1;
				const { layouts } = matchRoute('/', routes);
				expect(layouts).toEqual([Layout1]);
			});

			it('should break out of layouts', () => {
				const NoLayout = (() => 'NoLayout') as Component;
				routes['/(nolayout)'] = NoLayout;
				(routes['/posts'] as Routes)['/(nolayout)'] = NoLayout;
				const { match: match1, layouts: layouts1 } = matchRoute('/nolayout', routes);
				const { match: match2, layouts: layouts2 } = matchRoute('/posts/nolayout', routes);
				expect(match1).toEqual(NoLayout);
				expect(layouts1).toEqual([]);
				expect(match2).toEqual(NoLayout);
				expect(layouts2).toEqual([]);
				delete routes['/(nolayout)'];
			});
		}

		it('should match wildcard route', () => {
			const { match, layouts } = matchRoute('/notfound', routes);
			expect(match).toEqual(PageNotFound);
			if (treeMode) {
				expect(layouts).toEqual([]);
			}
		});

		it('should match wildcard nested route', () => {
			const { match, layouts } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(UserNotFound);
			if (treeMode) {
				expect(layouts).toEqual([Layout1]);
			}
		});

		it('should not match any route', () => {
			delete routes['*'];
			const { match } = matchRoute('/notfound', routes);
			expect(match).toBeUndefined();
		});
	});
});

describe('sortRoutes', () => {
	it('should sort routes', () => {
		const result = sortRoutes(['/:id', '*', '/foo', '', '/']);
		expect(result).toEqual(['', '/', '/foo', '/:id', '*']);
	});
});
