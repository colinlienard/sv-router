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
const Layout3 = () => 'Layout3';
/** @type {import('svelte').Component} */
const Users = () => 'Users';
const John = () => 'John';
const Hooks1 = Symbol();
const Hooks2 = Symbol();

/** @param {Record<string, unknown>} obj */
const r = (obj) => /** @type {import('../src/index.d.ts').Routes} */ (/** @type {unknown} */ (obj));

describe('matchRoute', () => {
	describe.each([
		{
			mode: 'flat',
			routes: r({
				'/': Home,
				'/posts': Posts,
				'/posts/static': StaticPost,
				'/posts/:id': DynamicPost,
				'/posts/:id/comments/:commentId': DynamicPostComment,
				'/users/john': John,
				'/users/*': UserNotFound,
				'*rest': PageNotFound,
			}),
		},
		{
			mode: 'flat unordered',
			routes: r({
				'/posts/:id/comments/:commentId': DynamicPostComment,
				'/posts': Posts,
				'/users/*': UserNotFound,
				'/posts/static': StaticPost,
				'*rest': PageNotFound,
				'/posts/:id': DynamicPost,
				'/': Home,
				'/users/john': John,
			}),
		},
		{
			mode: 'tree',
			routes: r({
				'/': Home,
				'/posts': {
					'/': Posts,
					'/static': StaticPost,
					'/:id': {
						'/': DynamicPost,
						'/comments': {
							'/:commentId': DynamicPostComment,
						},
						layout: Layout2,
					},
					layout: Layout1,
				},
				'/users': {
					john: John,
					'*': UserNotFound,
					layout: Layout1,
				},
				'*rest': PageNotFound,
			}),
		},
		{
			mode: 'tree unordered',
			routes: r({
				'*rest': PageNotFound,
				'/posts': {
					'/:id': {
						'/comments': {
							'/:commentId': DynamicPostComment,
						},
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
					john: John,
				},
				'/': Home,
			}),
		},
	])('$mode paths', ({ mode, routes }) => {
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
			const { match: match1 } = matchRoute('/Posts', routes);
			const { match: match2 } = matchRoute('/posts', r({ '/Posts': Posts }));
			expect(match1).toEqual(Posts);
			expect(match2).toEqual(Posts);
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

		it('should decode URL-encoded params', () => {
			const { match, params } = matchRoute('/posts/hello%20world', routes);
			expect(match).toEqual(DynamicPost);
			expect(params).toEqual({ id: 'hello world' });
		});

		it('should decode URL-encoded params with special characters', () => {
			const { match, params } = matchRoute('/posts/foo%2Fbar/comments/baz%3Fqux', routes);
			expect(match).toEqual(DynamicPostComment);
			expect(params).toEqual({ id: 'foo/bar', commentId: 'baz?qux' });
		});

		it('should match catch-all route', () => {
			const { match, params, layouts } = matchRoute('/not/found', routes);
			expect(match).toEqual(PageNotFound);
			expect(params).toEqual({ rest: 'not/found' });
			if (treeMode) {
				expect(layouts).toEqual([]);
			}
		});

		it('should decode URL-encoded params in catch-all routes', () => {
			const { match, params } = matchRoute('/not%20found/path%2Fwith%2Fslashes', routes);
			expect(match).toEqual(PageNotFound);
			expect(params).toEqual({ rest: 'not found/path/with/slashes' });
		});

		it('should match catch-all nested route', () => {
			const { match, params, layouts } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(UserNotFound);
			expect(params).toEqual({});
			if (treeMode) {
				expect(layouts).toEqual([Layout1]);
			}
		});
	});

	describe('layouts', () => {
		it('should match routes with layout', () => {
			const routes = r({
				'/': Home,
				'/posts': {
					'/': Posts,
					'/static': StaticPost,
					'/:id': {
						'/': DynamicPost,
						'/comments': { '/:commentId': DynamicPostComment },
						layout: Layout2,
					},
					layout: Layout1,
				},
			});
			expect(matchRoute('/', routes).layouts).toEqual([]);
			expect(matchRoute('/posts', routes).layouts).toEqual([Layout1]);
			expect(matchRoute('/posts/static', routes).layouts).toEqual([Layout1]);
			expect(matchRoute('/posts/bar/comments/baz', routes).layouts).toEqual([Layout1, Layout2]);
		});

		it('should match catch-all routes with layout', () => {
			const routes = r({
				'/users': { '*': UserNotFound, layout: Layout1 },
			});
			const { match, layouts } = matchRoute('/users', routes);
			expect(match).toEqual(UserNotFound);
			expect(layouts).toEqual([Layout1]);
		});

		it('should collect hooks and meta for catch-all routes', () => {
			const routes = r({
				'/users': {
					'*': UserNotFound,
					layout: Layout1,
					hooks: Hooks1,
					meta: { section: 'users' },
				},
			});
			const { match, layouts, hooks, meta } = matchRoute('/users/unknown', routes);
			expect(match).toEqual(UserNotFound);
			expect(layouts).toEqual([Layout1]);
			expect(hooks).toEqual([Hooks1]);
			expect(meta).toEqual({ section: 'users' });
		});

		it('should find root layout', () => {
			const routes = r({ '/': Home, layout: Layout1 });
			const { layouts } = matchRoute('/', routes);
			expect(layouts).toEqual([Layout1]);
		});

		it('should break out of layouts', () => {
			const routes = r({
				'/': Home,
				'/(nolayout)': NoLayout,
				layout: Layout1,
			});
			const { match, layouts } = matchRoute('/nolayout', routes);
			expect(match).toEqual(NoLayout);
			expect(layouts).toEqual([]);
		});

		it('should break out of layouts with a param', () => {
			const routes = r({
				'/users': { '/(:foo)': NoLayout, layout: Layout1 },
			});
			const { match, layouts, params } = matchRoute('/users/nolayout', routes);
			expect(match).toEqual(NoLayout);
			expect(layouts).toEqual([]);
			expect(params).toEqual({ foo: 'nolayout' });
		});

		it('should break out of layouts with catch-all', () => {
			const routes = r({
				'/users': { '(*foo)': UserNotFound, layout: Layout1 },
			});
			const { match, layouts, params } = matchRoute('/users/nolayout', routes);
			expect(match).toEqual(UserNotFound);
			expect(layouts).toEqual([]);
			expect(params).toEqual({ foo: 'nolayout' });
		});

		it('should break out of layouts with deeply nested routes', () => {
			const routes = r({
				'/parent': {
					'/mid': { '/(slug)': NoLayout },
					layout: Layout1,
				},
			});
			const { match, layouts } = matchRoute('/parent/mid/slug', routes);
			expect(match).toEqual(NoLayout);
			expect(layouts).toEqual([]);
		});

		it('should break out of all layouts with multiple nested layouts', () => {
			const routes = r({
				'/parent': {
					'/child': { '/(slug)': NoLayout, layout: Layout2 },
					layout: Layout1,
				},
			});
			const { match, layouts } = matchRoute('/parent/child/slug', routes);
			expect(match).toEqual(NoLayout);
			expect(layouts).toEqual([]);
		});

		it('should break out of layouts with deeply nested param routes', () => {
			const routes = r({
				'/parent': {
					'/mid': { '/(:id)': NoLayout },
					layout: Layout1,
				},
			});
			const { match, layouts, params } = matchRoute('/parent/mid/42', routes);
			expect(match).toEqual(NoLayout);
			expect(layouts).toEqual([]);
			expect(params).toEqual({ id: '42' });
		});

		it('should break out of layouts at four levels of nesting', () => {
			const routes = r({
				'/a': {
					'/b': {
						'/c': { '/(leaf)': NoLayout, layout: Layout2 },
					},
					layout: Layout1,
				},
			});
			const { match, layouts } = matchRoute('/a/b/c/leaf', routes);
			expect(match).toEqual(NoLayout);
			expect(layouts).toEqual([]);
		});

		describe('named layout target', () => {
			const nested = (/** @type {Record<string, unknown>} */ leaves) =>
				r({
					'/a': {
						'/b': {
							'/c': { ...leaves, layout: Layout3 },
							layout: Layout2,
						},
						layout: Layout1,
					},
					layout: Layout1,
				});

			it.each([
				{ target: 'c', expected: [Layout1, Layout1, Layout2, Layout3] },
				{ target: 'b', expected: [Layout1, Layout1, Layout2] },
				{ target: 'a', expected: [Layout1, Layout1] },
				{ target: '', expected: [Layout1] },
			])('should keep layouts up to `@$target`', ({ target, expected }) => {
				const routes = nested({ [`/leaf@${target}`]: NoLayout });
				const { match, layouts } = matchRoute('/a/b/c/leaf', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual(expected);
			});

			it('should not affect sibling routes', () => {
				const routes = nested({ '/leaf@a': NoLayout, '/other': Home });
				expect(matchRoute('/a/b/c/other', routes).layouts).toEqual([
					Layout1,
					Layout1,
					Layout2,
					Layout3,
				]);
			});

			it('should work with an index route', () => {
				const routes = nested({ '/@b': NoLayout });
				const { match, layouts } = matchRoute('/a/b/c', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([Layout1, Layout1, Layout2]);
			});

			it('should work with a param route', () => {
				const routes = nested({ '/:id@a': NoLayout });
				const { match, layouts, params } = matchRoute('/a/b/c/42', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([Layout1, Layout1]);
				expect(params).toEqual({ id: '42' });
			});

			it('should work with a catch-all route', () => {
				const routes = nested({ '*rest@b': UserNotFound });
				const { match, layouts, params } = matchRoute('/a/b/c/x/y', routes);
				expect(match).toEqual(UserNotFound);
				expect(layouts).toEqual([Layout1, Layout1, Layout2]);
				expect(params).toEqual({ rest: 'x/y' });
			});

			it('should target a param segment', () => {
				const routes = r({
					'/users': {
						'/:id': { '/settings@:id': NoLayout, '/': John, layout: Layout2 },
						'/': Users,
						layout: Layout1,
					},
				});
				const { match, layouts, params } = matchRoute('/users/7/settings', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([Layout1, Layout2]);
				expect(params).toEqual({ id: '7' });
			});

			it('should drop layout group layouts below the target', () => {
				const routes = r({
					'/a': {
						'/': { '/leaf@a': NoLayout, '/other': Home, layout: Layout2 },
						layout: Layout1,
					},
				});
				expect(matchRoute('/a/leaf', routes).layouts).toEqual([Layout1]);
				expect(matchRoute('/a/other', routes).layouts).toEqual([Layout1, Layout2]);
			});

			it('should not be ranked as a dynamic route when targeting a param', () => {
				const routes = r({ '/:id': { '/:tab': Home, '/edit@:id': NoLayout, layout: Layout1 } });
				const { match, layouts, params } = matchRoute('/7/edit', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([Layout1]);
				expect(params).toEqual({ id: '7' });
			});

			it('should drop nested layouts when targeting from nested routes', () => {
				const routes = r({
					'/a': {
						'/x@a': { '/': NoLayout, layout: Layout3 },
						'/y': { '/': Home, layout: Layout3 },
						layout: Layout2,
					},
					layout: Layout1,
				});
				expect(matchRoute('/a/x', routes)).toMatchObject({ match: NoLayout });
				expect(matchRoute('/a/x', routes).layouts).toEqual([Layout1, Layout2]);
				expect(matchRoute('/a/y', routes).layouts).toEqual([Layout1, Layout2, Layout3]);
			});

			it('should treat `@` literally when it does not name an ancestor', () => {
				const routes = nested({ '/leaf@nope': NoLayout });
				const { match, layouts } = matchRoute('/a/b/c/leaf@nope', routes);
				expect(match).toEqual(NoLayout);
				expect(layouts).toEqual([Layout1, Layout1, Layout2, Layout3]);
				expect(matchRoute('/a/b/c/leaf', routes).match).toBeUndefined();
			});

			it('should keep literal `@` routes working', () => {
				const routes = r({ '/@me': Home, '/users': { '/me@home': Users }, layout: Layout1 });
				expect(matchRoute('/@me', routes)).toMatchObject({ match: Home, layouts: [Layout1] });
				expect(matchRoute('/users/me@home', routes)).toMatchObject({
					match: Users,
					layouts: [Layout1],
				});
			});
		});
	});

	describe('hooks', () => {
		it('should match one hook', () => {
			const routes = r({
				'/posts': { '/': Posts, hooks: Hooks1 },
			});
			const { hooks } = matchRoute('/posts', routes);
			expect(hooks).toEqual([Hooks1]);
		});

		it('should match multiple hooks', () => {
			const routes = r({
				'/posts': {
					'/:id': {
						'/comments': { '/:commentId': DynamicPostComment },
						hooks: Hooks2,
					},
					hooks: Hooks1,
				},
			});
			const { hooks } = matchRoute('/posts/bar/comments/baz', routes);
			expect(hooks).toEqual([Hooks1, Hooks2]);
		});
	});

	describe('meta', () => {
		it('should match a route with a meta property', () => {
			const routes = r({
				'/posts': {
					'/': Posts,
					meta: { public: true, requiresAuth: false },
				},
			});
			const { meta } = matchRoute('/posts', routes);
			expect(meta).toEqual({ public: true, requiresAuth: false });
		});

		it('should merge two routes metadata', () => {
			const routes = r({
				'/posts': {
					'/:id': {
						'/comments': {
							'/:commentId': DynamicPostComment,
							meta: { public: false, section: 'comments' },
						},
					},
					meta: { public: true, requiresAuth: false },
				},
			});
			const { meta } = matchRoute('/posts/bar/comments/baz', routes);
			expect(meta).toEqual({ public: false, section: 'comments', requiresAuth: false });
		});

		it('should merge parent meta with nested route meta in route groups', () => {
			const routes = r({
				'/': { '/': Home, meta: { title: 'Admin', theme: 'dark' } },
				'/users': { '/': Users, meta: { title: 'Users' } },
			});
			const { meta } = matchRoute('/users', routes);
			expect(meta).toEqual({ title: 'Users', theme: 'dark' });
		});
	});

	describe('catch-all fallback', () => {
		it('should fall back to root catch-all when nested catch-all is not found', () => {
			const routes = r({
				'/users': { john: John, layout: Layout1 },
				'*rest': PageNotFound,
			});
			const { match } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(PageNotFound);
		});

		it('should break out of layouts when falling back to root catch-all', () => {
			const routes = r({
				'/users': { john: John, layout: Layout1 },
				'(*rest)': PageNotFound,
			});
			const { match, layouts } = matchRoute('/users/notfound', routes);
			expect(match).toEqual(PageNotFound);
			expect(layouts).toEqual([]);
		});

		it('should not duplicate layout when partial match falls back to catch-all', () => {
			const routes = r({
				'*': PageNotFound,
				'/foo': Home,
				layout: Layout1,
			});
			const { match, layouts } = matchRoute('/foo/baz', routes);
			expect(match).toEqual(PageNotFound);
			expect(layouts).toEqual([Layout1]);
		});

		it('should not match any route when no catch-all exists', () => {
			const routes = r({ '/': Home, '/posts': Posts });
			const { match } = matchRoute('/notfound', routes);
			expect(match).toBeUndefined();
		});
	});

	describe('layout groups', () => {
		it('should match root path through "/" layout group', () => {
			const routes = r({
				'/': { '/': Home, '/users': Users, layout: Layout1 },
			});
			const { match, layouts } = matchRoute('/', routes);
			expect(match).toEqual(Home);
			expect(layouts).toEqual([Layout1]);
		});

		it('should match nested path through "/" layout group', () => {
			const routes = r({
				'/': { '/': Home, '/users': Users, layout: Layout1 },
			});
			const { match, layouts } = matchRoute('/users', routes);
			expect(match).toEqual(Users);
			expect(layouts).toEqual([Layout1]);
		});

		it('should not match unknown paths', () => {
			const routes = r({
				'/': { '/': Home, '/users': Users, layout: Layout1 },
			});
			const { match } = matchRoute('/unknown', routes);
			expect(match).toBeUndefined();
		});
	});

	describe('catch-all in layout group', () => {
		it('should prefer specific route outside layout group over catch-all inside', () => {
			const routes = r({
				'/': {
					'/': Home,
					'/about': Users,
					'*notfound': PageNotFound,
					layout: Layout1,
				},
				'/a/more/nested/route': John,
			});
			const { match, layouts } = matchRoute('/a/more/nested/route', routes);
			expect(match).toEqual(John);
			expect(layouts).toEqual([]);
		});

		it('should still match catch-all when no specific route exists', () => {
			const routes = r({
				'/': {
					'/': Home,
					'*notfound': PageNotFound,
					layout: Layout1,
				},
				'/a/more/nested/route': John,
			});
			const { match, layouts } = matchRoute('/unknown', routes);
			expect(match).toEqual(PageNotFound);
			expect(layouts).toEqual([Layout1]);
		});
	});
});

describe('sortRoutes', () => {
	it('should sort routes', () => {
		const result = sortRoutes(['/:id', '*rest', '/foo', '', '/']);
		expect(result).toEqual(['', '/', '/foo', '/:id', '*rest']);
	});
});
