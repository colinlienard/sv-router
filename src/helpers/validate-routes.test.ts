import type { Component } from 'svelte';
import { getRoutePaths, validateRoutes } from './validate-routes.ts';

const component = (() => ({})) as Component;

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
				'*': component,
			},
			'*': component,
		});
		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it('should raise a warning if wildcard route is misplaced', () => {
		validateRoutes({
			'/': component,
			'*': component,
			'/posts': component,
		});
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('*'));
	});

	it('should raise a warning if nested wildcard route is misplaced', () => {
		validateRoutes({
			'/': component,
			'/about': component,
			'/posts': component,
			'/posts/*': component,
			'/posts/:id': component,
		});
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('/posts/*'));
	});

	it('should raise multiple warnings if nested wildcard route are misplaced', () => {
		validateRoutes({
			'/': component,
			'*': component,
			'/about': component,
			'/posts': {
				'/': component,
				'*': component,
				'/:id': component,
			},
		});
		expect(consoleSpy).toHaveBeenCalledTimes(2);
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('/*'));
		expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('/posts/*'));
	});
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
