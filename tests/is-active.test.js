import { location } from '../src/create-router.svelte.js';
import { isActive } from '../src/helpers/is-active.js';

vi.mock('../src/create-router.svelte.js', () => ({
	location: {
		pathname: '',
	},
}));

afterEach(() => {
	vi.resetAllMocks();
});

describe('isActive', () => {
	it('should match a simple route', () => {
		location.pathname = '/about';
		expect(isActive('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
		location.pathname = '/post/123';
		expect(isActive('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match a route with any param', () => {
		location.pathname = '/post/123';
		expect(isActive('/post/:id')).toBe(true);
	});

	it('should match a route with params', () => {
		location.pathname = '/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId', { id: '123', commentId: '456' })).toBe(true);
	});

	it('should match a route with any params', () => {
		location.pathname = '/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match', () => {
		location.pathname = '/foo';
		expect(isActive('/hello')).toBe(false);
	});

	it('should not match either', () => {
		location.pathname = '/foo/bar';
		expect(isActive('/hello/:id', { id: 'world' })).toBe(false);
	});
});

describe('isActive.startsWith', () => {
	it('should match a simple route', () => {
		location.pathname = '/about/me';
		expect(isActive.startsWith('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
		location.pathname = '/post/123/foo';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match a route with any param', () => {
		location.pathname = '/post/123/foo';
		expect(isActive.startsWith('/post/:id')).toBe(true);
	});

	it('should match a route with params', () => {
		location.pathname = '/post/123/comments/456/foo';
		expect(
			isActive.startsWith('/post/:id/comments/:commentId', { id: '123', commentId: '456' }),
		).toBe(true);
	});

	it('should match a route with any params', () => {
		location.pathname = '/post/123/comments/456/foo';
		expect(isActive.startsWith('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match', () => {
		location.pathname = '/foo';
		expect(isActive.startsWith('/hello')).toBe(false);
	});

	it('should not match either', () => {
		location.pathname = '/foo/bar';
		expect(isActive.startsWith('/hello/:id', { id: 'world' })).toBe(false);
	});
});
