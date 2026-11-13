import { createRouteMap } from '../src/gen/generate-router-code.js';
import { matchRoute } from '../src/helpers/match-route.js';

/** @typedef {import('../src/gen/generate-router-code.js').FileTree} FileTree */

/** @param {FileTree} tree */
function generateRoutes(tree) {
	const files = new Map();
	/**
	 * @param {import('../src/gen/generate-router-code.js').GeneratedRoutes} routes
	 * @returns {Record<string, unknown>}
	 */
	function resolve(routes) {
		return Object.fromEntries(
			Object.entries(routes).map(([key, value]) => {
				if (typeof value === 'string') {
					if (!files.has(value)) {
						files.set(value, key === 'hooks' || key === 'meta' ? { [value]: true } : () => {});
					}
					return [key, files.get(value)];
				}
				if (Array.isArray(value)) {
					return [key, Object.assign({}, ...value.map((file) => ({ [file]: true })))];
				}
				return [key, resolve(value)];
			}),
		);
	}
	const routes = /** @type {import('../src/index.d.ts').Routes} */ (resolve(createRouteMap(tree)));
	return { routes, files };
}

/**
 * @param {string[]} folders
 * @param {FileTree} tree
 * @returns {FileTree}
 */
function nest(folders, tree) {
	for (const name of folders.toReversed()) {
		tree = [{ name, tree: ['layout.svelte', 'hooks.ts', 'meta.ts', ...tree] }];
	}
	return ['layout.svelte', 'hooks.ts', 'meta.ts', ...tree];
}

describe('generated layout boundaries', () => {
	it.each([
		['_outer', '_inner'],
		['_outer', 'inner'],
		['outer', '_inner'],
		['outer', 'inner'],
	])('a parenthesized page skips layouts in %s/%s', (outer, inner) => {
		const folders = [outer, inner];
		const { routes, files } = generateRoutes(nest(folders, ['(example).svelte']));
		const pathname =
			'/' + [...folders.filter((name) => !name.startsWith('_')), 'example'].join('/');
		const result = matchRoute(pathname, routes);
		expect(result.match).toBe(files.get(`${outer}/${inner}/(example).svelte`));
		expect(result.layouts).toEqual([]);
		expect(result.hooks).toEqual([
			files.get('hooks.ts'),
			files.get(`${outer}/hooks.ts`),
			files.get(`${outer}/${inner}/hooks.ts`),
		]);
		expect(result.meta).toEqual({
			'meta.ts': true,
			[`${outer}/meta.ts`]: true,
			[`${outer}/${inner}/meta.ts`]: true,
		});
	});

	it.each(['(example).svelte', '(index).svelte', '([id]).svelte', '([...rest]).svelte'])(
		'%s skips nested route-group layouts',
		(page) => {
			const { routes, files } = generateRoutes(nest(['_outer', '_inner'], [page]));
			const pathname = page.includes('index') ? '/' : page.includes('rest') ? '/a/b' : '/example';
			const result = matchRoute(pathname, routes);
			expect(result.match).toBe(files.get(`_outer/_inner/${page}`));
			expect(result.layouts).toEqual([]);
			if (page.includes('id')) expect(result.params).toEqual({ id: 'example' });
			if (page.includes('rest')) expect(result.params).toEqual({ rest: 'a/b' });
		},
	);

	it.each([
		{ parents: [] },
		{ parents: ['outer'] },
		{ parents: ['outer', 'middle'] },
		{ parents: ['_group'] },
		{ parents: ['_outer', '_inner'] },
		{ parents: ['outer', '_group'] },
	])(
		'a parenthesized folder retains its own and descendant layouts under $parents',
		({ parents }) => {
			const folders = [...parents, '(section)', 'child'];
			const { routes, files } = generateRoutes(nest(folders, ['example.svelte', '(alone).svelte']));
			const prefix = parents.length > 0 ? parents.join('/') + '/' : '';
			const url =
				'/' + [...parents.filter((name) => !name.startsWith('_')), 'section', 'child'].join('/');
			const result = matchRoute(url + '/example', routes);
			expect(result.match).toBe(files.get(`${prefix}(section)/child/example.svelte`));
			expect(result.layouts).toEqual([
				files.get(`${prefix}(section)/layout.svelte`),
				files.get(`${prefix}(section)/child/layout.svelte`),
			]);
			expect(result.hooks).toHaveLength(folders.length + 1);
			expect(Object.keys(result.meta)).toHaveLength(folders.length + 1);
			expect(matchRoute(url + '/alone', routes).layouts).toEqual([]);
		},
	);

	it('resets inheritance again at a nested parenthesized folder', () => {
		const { routes, files } = generateRoutes(
			nest(['(outer)', 'middle', '(inner)'], ['example.svelte']),
		);
		expect(matchRoute('/outer/middle/inner/example', routes).layouts).toEqual([
			files.get('(outer)/middle/(inner)/layout.svelte'),
		]);
	});

	it('retains route-group layouts inside a reset folder', () => {
		const { routes, files } = generateRoutes(
			nest(['outer', '(section)', '_group'], ['example.svelte']),
		);
		expect(matchRoute('/outer/section/example', routes).layouts).toEqual([
			files.get('outer/(section)/layout.svelte'),
			files.get('outer/(section)/_group/layout.svelte'),
		]);
	});

	it('supports parenthesized dynamic folders', () => {
		const { routes, files } = generateRoutes(
			nest(['outer', '_group', '([id])'], ['example.svelte']),
		);
		const result = matchRoute('/outer/42/example', routes);
		expect(result.match).toBe(files.get('outer/_group/([id])/example.svelte'));
		expect(result.layouts).toEqual([files.get('outer/_group/([id])/layout.svelte')]);
		expect(result.params).toEqual({ id: '42' });
	});

	it('resolves an ordinary catch-all inside route groups without losing layouts', () => {
		const { routes, files } = generateRoutes(nest(['_outer', '_inner'], ['[...rest].svelte']));
		const result = matchRoute('/a/b', routes);
		expect(result.match).toBe(files.get('_outer/_inner/[...rest].svelte'));
		expect(result.params).toEqual({ rest: 'a/b' });
		expect(result.layouts).toEqual([
			files.get('layout.svelte'),
			files.get('_outer/layout.svelte'),
			files.get('_outer/_inner/layout.svelte'),
		]);
	});

	it('allows a reset folder without its own layout and leaves siblings unchanged', () => {
		const { routes, files } = generateRoutes([
			'layout.svelte',
			'sibling.svelte',
			{
				name: '(section)',
				tree: ['example.svelte', { name: 'child', tree: ['layout.svelte', 'example.svelte'] }],
			},
		]);
		expect(matchRoute('/section/example', routes).layouts).toEqual([]);
		expect(matchRoute('/section/child/example', routes).layouts).toEqual([
			files.get('(section)/child/layout.svelte'),
		]);
		expect(matchRoute('/sibling', routes).layouts).toEqual([files.get('layout.svelte')]);
	});
});
