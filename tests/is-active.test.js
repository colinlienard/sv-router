import { base, location } from '../src/create-router.svelte.js';
import { isActive } from '../src/helpers/is-active.js';

vi.mock('../src/create-router.svelte.js', () => ({
	location: {
		pathname: '',
	},
	base: {
		name: undefined,
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

	it('should not match a simple route', () => {
		location.pathname = '/foo';
		expect(isActive('/about')).toBe(false);
	});

	it('should not match a route with any param', () => {
		location.pathname = '/foo/bar';
		expect(isActive('/post/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
		location.pathname = '/foo/bar';
		expect(isActive('/post/:id', { id: '123' })).toBe(false);
	});

	it('should work with a basename', () => {
		location.pathname = '/my-app/post/123';
		base.name = '/my-app';
		expect(isActive('/post/:id', { id: '123' })).toBe(true);
		base.name = undefined;
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
		expect(isActive.startsWith('/post/:id', { id: '123', commentId: '456' })).toBe(true);
	});

	it('should match a route with any params', () => {
		location.pathname = '/post/123/comments/456/foo';
		expect(isActive.startsWith('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match a simple route', () => {
		location.pathname = '/foo';
		expect(isActive.startsWith('/hello')).toBe(false);
	});

	it('should not match a route with any param', () => {
		location.pathname = '/foo/bar';
		expect(isActive.startsWith('/hello/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
		location.pathname = '/foo/bar';
		expect(isActive.startsWith('/hello/:id', { id: 'world' })).toBe(false);
	});

	it('should work with a basename', () => {
		location.pathname = '/my-app/post/123/foo';
		base.name = '/my-app';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
		base.name = undefined;
	});
});
