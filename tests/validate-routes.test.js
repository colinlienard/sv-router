import { getRoutePaths, validateRoutes } from '../src/helpers/validate-routes.js';

/** @type {import('svelte').Component} */
const component = () => ({});

const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn());

beforeEach(() => {
	vi.clearAllMocks();
});

describe('validateRoutes', () => {
	it('should validate routes', () => {
		validateRoutes({
			'/': component,
			'/about': component,
			'/posts': {
				'/': component,
				'/:id': component,
			},
			'*': component,
		});
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it('should raise a warning if a wildcard route is at the same level as a dynamic route', () => {
		validateRoutes({
			'/': component,
			'/:id': component,
			'*': component,
		});
		expect(consoleSpy).toHaveBeenCalledWith(
			'Router warning: Wildcard route `*` should not be at the same level as dynamic route `/:id`.',
		);
	});

	it.each([
		{
			'/': component,
			'/posts/*': component,
			'/posts/:id': component,
			'/:id': component,
			'*': component,
		},
		{
			'/': component,
			'/posts': {
				'*': component,
				'/:id': component,
			},
			'/:id': component,
			'*': component,
		},
	])(
		'should raise multiple warnings if wildcard routes are at the same level as dynamic routes',
		(routes) => {
			validateRoutes(
				/** @type {import('../src/index.d.ts').Routes} */ (/** @type {unknown} */ (routes)),
			);
			expect(consoleSpy).toHaveBeenCalledTimes(2);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Router warning: Wildcard route `*` should not be at the same level as dynamic route `/:id`.',
			);
			expect(consoleSpy).toHaveBeenCalledWith(
				'Router warning: Wildcard route `/posts/*` should not be at the same level as dynamic route `/posts/:id`.',
			);
		},
	);
});

describe('getRoutePaths', () => {
	it('should return all paths in an array', () => {
		const result = getRoutePaths({
			'/': component,
			'/about': component,
			'/posts': {
				'/': component,
				'/:id': component,
				'*': component,
			},
			'/foo/bar': component,
			'*': component,
		});
		expect(result).toEqual(['/', '/about', '/posts', '/posts/:id', '/posts/*', '/foo/bar', '*']);
	});
});
