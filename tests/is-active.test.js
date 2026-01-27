import { base, location } from '../src/create-router.svelte.js';
import { isActive } from '../src/helpers/is-active.js';

describe('isActive', () => {
	beforeEach(() => {
		base.name = undefined;
	});

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
		location.pathname = '/post';
		expect(isActive('/post/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
		location.pathname = '/post';
		expect(isActive('/post/:id', { id: '123' })).toBe(false);
	});

	it('should match with a basename', () => {
		base.name = '/my-app';
		location.pathname = '/my-app/post/123';
		expect(isActive('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match with a basename and a simple route', () => {
		base.name = '/dashboard';
		location.pathname = '/dashboard';
		expect(isActive('/')).toBe(true);
	});

	it('should not match a different route with a basename', () => {
		base.name = '/dashboard';
		location.pathname = '/dashboard/about';
		expect(isActive('/')).toBe(false);
	});
});

describe('isActive (hash-based)', () => {
	beforeEach(() => {
		base.name = '#';
	});

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
		location.pathname = '/post';
		expect(isActive('/post/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
		location.pathname = '/post';
		expect(isActive('/post/:id', { id: '123' })).toBe(false);
	});
});

describe('isActive.startsWith', () => {
	beforeEach(() => {
		base.name = undefined;
	});

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

	it('should match with a basename', () => {
		base.name = '/my-app';
		location.pathname = '/my-app/post/123/foo';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match with a basename and a simple route', () => {
		base.name = '/dashboard';
		location.pathname = '/dashboard/about';
		expect(isActive.startsWith('/')).toBe(true);
	});
});

describe('isActive.startsWith (hash-based)', () => {
	beforeEach(() => {
		base.name = '#';
	});

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
});
