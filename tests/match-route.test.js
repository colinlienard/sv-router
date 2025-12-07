import { matchRoute, sortRoutes } from '../src/helpers/match-route.js';

/** @type {import('svelte').Component} */
const Home = () => 'Home';
/** @type {import('svelte').Component} */
const Posts = () => 'Posts';
/** @type {import('svelte').Component} */
const StaticPost = () => 'StaticPost';
/** @type {import('svelte').Component} */
const DynamicPost = () => 'DynamicPost';
/** @type {import('svelte').Component} */
const DynamicPostComment = () => 'DynamicPostComment';
/** @type {import('svelte').Component} */
const UserNotFound = () => 'UserNotFound';
/** @type {import('svelte').Component} */
const PageNotFound = () => 'PageNotFound';
/** @type {import('svelte').Component} */
const Layout1 = () => 'Layout1';
/** @type {import('svelte').Component} */
const Layout2 = () => 'Layout2';
/** @type {import('svelte').Component} */
const NoLayout = () => 'NoLayout';
/** @type {import('svelte').Component} */
const Users = () => 'Users';
const John = () => 'John';
const Hooks1 = Symbol();
const Hooks2 = Symbol();

describe('matchRoute', () => {
	describe.each([
		{
			mode: 'flat',
			routes: {
				'/': Home,
				'/posts': Posts,
				'/posts/static': StaticPost,
				'/posts/:id': DynamicPost,
				'/posts/:id/comments/:commentId': DynamicPostComment,
				'/users/john': John,
				'/users/*': UserNotFound,
				'*rest': PageNotFound,
			},
		},
		{
			mode: 'flat unordered',
			routes: {
				'/posts/:id/comments/:commentId': DynamicPostComment,
				'/posts': Posts,
				'/users/*': UserNotFound,
				'/posts/static': StaticPost,
				'*rest': PageNotFound,
				'/posts/:id': DynamicPost,
				'/': Home,
				'/users/john': John,
			},
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
						'/comments': {
							'/:commentId': DynamicPostComment,
							meta: {
								public: false,
								section: 'comments',
							},
						},
						layout: Layout2,
						hooks: Hooks2,
					},
					layout: Layout1,
					hooks: Hooks1,
					meta: {
						public: true,
						requiresAuth: false,
					},
				},
				'/users': {
					john: John,
					'*': UserNotFound,
					layout: Layout1,
				},
				'*rest': PageNotFound,
			},
		},
		{
			mode: 'tree unordered',
			routes: {
				'*rest': PageNotFound,
				'/posts': {
					meta: {
						public: true,
						requiresAuth: false,
					},
					'/:id': {
						'/comments': {
							meta: {
								public: false,
								section: 'comments',
							},
							'/:commentId': DynamicPostComment,
						},
						'/': DynamicPost,
						hooks: Hooks2,
						layout: Layout2,
					},
					'/': Posts,
					hooks: Hooks1,
					'/static': StaticPost,
					layout: Layout1,
				},
				'/users': {
					'*': UserNotFound,
					layout: Layout1,
					john: John,
				},
				'/': Home,
			},
		},
	])('$mode paths', ({ mode, routes: r }) => {
		const routes = /** @type {import('../src/index.d.ts').Routes} */ (/** @type {unknown} */ (r));
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
			const { match } = matchRoute('/posts/', routes);
			expect(match).toEqual(Posts);
		});

		it('should match a simple route with a different casing', () => {
			const { match } = matchRoute('/Posts', routes);
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
			const { match, params } = matchRoute('/posts/bar/comments/baz', routes);
			expect(match).toEqual(DynamicPostComment);
			expect(params).toEqual({ id: 'bar', commentId: 'baz' });
		});

		it('should match a dynamic route with a different casing and return a param with the correct casing', () => {
			const { match, params } = matchRoute('/Posts/Bar/coMMENts/baZ', routes);
			expect(match).toEqual(DynamicPostComment);
			expect(params).toEqual({ id: 'Bar', commentId: 'baZ' });
		});

		it('should match catch-all route', () => {
			const { match, params, layouts } = matchRoute('/not/found', routes);
			expect(match).toEqual(PageNotFound);
			expect(params).toEqual({ rest: 'not/found' });
			if (treeMode) {
				expect(layouts).toEqual([]);
			}
		});

		it('should match catch-all nested route', () => {
			const { match, params, layouts } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(UserNotFound);
			expect(params).toEqual({});
			if (treeMode) {
				expect(layouts).toEqual([Layout1]);
			}
		});

		if (treeMode) {
			it('should match routes with layout', () => {
				const { layouts: layouts1 } = matchRoute('/', routes);
				const { layouts: layouts2 } = matchRoute('/posts', routes);
				const { layouts: layouts3 } = matchRoute('/posts/static', routes);
				const { layouts: layouts4 } = matchRoute('/posts/bar/comments/baz', routes);
				expect(layouts1).toEqual([]);
				expect(layouts2).toEqual([Layout1]);
				expect(layouts3).toEqual([Layout1]);
				expect(layouts4).toEqual([Layout1, Layout2]);
			});

			it('should match catch-all routes with layout', () => {
				const { match, layouts } = matchRoute('/users', routes);
				expect(match).toEqual(UserNotFound);
				expect(layouts).toEqual([Layout1]);
			});

			it('should also find root layout', () => {
				routes['layout'] = Layout1;
				const { layouts } = matchRoute('/', routes);
				expect(layouts).toEqual([Layout1]);
			});

			it('should break out of layouts', () => {
				routes['/(nolayout)'] = NoLayout;
				const { match, layouts } = matchRoute('/nolayout', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([]);
				delete routes['/(nolayout)'];
			});

			it('should break out of layouts with a param', () => {
				/** @type {import('../src/index.d.ts').Routes} */ (routes['/users'])['/(:foo)'] = NoLayout;
				const { match, layouts, params } = matchRoute('/users/nolayout', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([]);
				expect(params).toEqual({ foo: 'nolayout' });
				delete (/** @type {import('../src/index.d.ts').Routes} */ (routes['/users'])['/(:foo)']);
			});

			it('should break out of layouts with catch-all', () => {
				/** @type {import('../src/index.d.ts').Routes} */ (routes['/users'])['(*foo)'] =
					UserNotFound;
				delete (/** @type {import('../src/index.d.ts').Routes} */ (routes['/users'])['*']);
				const { match, layouts, params } = matchRoute('/users/nolayout', routes);
				expect(match).toEqual(UserNotFound);
				expect(layouts).toEqual([]);
				expect(params).toEqual({ foo: 'nolayout' });
				delete (/** @type {import('../src/index.d.ts').Routes} */ (routes['/users'])['(*foo)']);
			});

			it('should match one hook', () => {
				const { hooks } = matchRoute('/posts', routes);
				expect(hooks).toEqual([Hooks1]);
			});

			it('should match multiple hooks', () => {
				const { hooks } = matchRoute('/posts/bar/comments/baz', routes);
				expect(hooks).toEqual([Hooks1, Hooks2]);
			});

			it('should match a route with a meta property', () => {
				const { meta } = matchRoute('/posts', routes);
				expect(meta).toEqual({
					public: true,
					requiresAuth: false,
				});
			});

			it('should merge two routes metadata', () => {
				const { meta } = matchRoute('/posts/bar/comments/baz', routes);
				expect(meta).toEqual({
					public: false,
					section: 'comments',
					requiresAuth: false,
				});
			});

			it('should merge parent meta with nested route meta in route groups', () => {
				const parentMeta = { title: 'Admin', theme: 'dark' };
				const childMeta = { title: 'Users' };
				const routesWithNestedMeta = /** @type {import('../src/index.d.ts').Routes} */ ({
					'/': {
						'/': Home,
						meta: parentMeta,
					},
					'/users': {
						'/': Users,
						meta: childMeta,
					},
				});
				const { meta } = matchRoute('/users', routesWithNestedMeta);
				expect(meta).toEqual({
					title: 'Users',
					theme: 'dark',
				});
			});
		}

		it('should fall back to root catch-all route when nested catch-all is not found', () => {
			delete routes['/users/*'];
			const { match } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(PageNotFound);
		});

		it('should break out of layouts when falling back to root catch-all', () => {
			delete routes['*rest'];
			routes['(*rest)'] = PageNotFound;
			const { match, layouts } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(PageNotFound);
			expect(layouts).toEqual([]);
		});

		it('should not match any route', () => {
			delete routes['(*rest)'];
			const { match } = matchRoute('/notfound', routes);
			expect(match).toBeUndefined();
		});
	});
});

describe('sortRoutes', () => {
	it('should sort routes', () => {
		const result = sortRoutes(['/:id', '*rest', '/foo', '', '/']);
		expect(result).toEqual(['', '/', '/foo', '/:id', '*rest']);
	});
});
