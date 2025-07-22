import { base, location } from '../src/create-router.svelte.js';
import { isActive } from '../src/helpers/is-active.js';

vi.mock('../src/create-router.svelte.js', async (importOriginal) => {
    const mod = await importOriginal();
    return mod;
});

describe('isActive', () => {
	it('should match a simple route', () => {
	    base.name = undefined;
		location.pathname = '/about';
		expect(isActive('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
	    base.name = undefined;
		location.pathname = '/post/123';
		expect(isActive('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match a route with any param', () => {
	    base.name = undefined;
		location.pathname = '/post/123';
		expect(isActive('/post/:id')).toBe(true);
	});

	it('should match a route with params', () => {
	    base.name = undefined;
		location.pathname = '/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId', { id: '123', commentId: '456' })).toBe(true);
	});

	it('should match a route with any params', () => {
	    base.name = undefined;
		location.pathname = '/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match a simple route', () => {
	    base.name = undefined;
		location.pathname = '/foo';
		expect(isActive('/about')).toBe(false);
	});

	it('should not match a route with any param', () => {
	    base.name = undefined;
		location.pathname = '/post';
		expect(isActive('/post/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
	    base.name = undefined;
		location.pathname = '/post';
		expect(isActive('/post/:id', { id: '123' })).toBe(false);
	});

	it('should work with a basename', () => {
		base.name = '/my-app';
		location.pathname = '/my-app/post/123';
		expect(isActive('/post/:id', { id: '123' })).toBe(true);
	});
});

describe('isActive with base="#"', () => {
	it('should match a simple route', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/about';
		expect(isActive('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123';
		expect(isActive('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match a route with any param', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123';
		expect(isActive('/post/:id')).toBe(true);
	});

	it('should match a route with params', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId', { id: '123', commentId: '456' })).toBe(true);
	});

	it('should match a route with any params', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match a simple route', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/foo';
		expect(isActive('/about')).toBe(false);
	});

	it('should not match a route with any param', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post';
		expect(isActive('/post/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post';
		expect(isActive('/post/:id', { id: '123' })).toBe(false);
	});
});

describe('isActive.startsWith', () => {
	it('should match a simple route', () => {
        base.name = undefined;
		location.pathname = '/about/me';
		expect(isActive.startsWith('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
        base.name = undefined;
		location.pathname = '/post/123/foo';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match a route with any param', () => {
        base.name = undefined;
		location.pathname = '/post/123/foo';
		expect(isActive.startsWith('/post/:id')).toBe(true);
	});

	it('should match a route with params', () => {
        base.name = undefined;
		location.pathname = '/post/123/comments/456/foo';
		expect(
			isActive.startsWith('/post/:id/comments/:commentId', { id: '123', commentId: '456' }),
		).toBe(true);
	});

	it('should match a route with any params', () => {
        base.name = undefined;
		location.pathname = '/post/123/comments/456/foo';
		expect(isActive.startsWith('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match a simple route', () => {
        base.name = undefined;
		location.pathname = '/foo';
		expect(isActive.startsWith('/hello')).toBe(false);
	});

	it('should not match a route with any param', () => {
        base.name = undefined;
		location.pathname = '/foo/bar';
		expect(isActive.startsWith('/hello/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
        base.name = undefined;
		location.pathname = '/foo/bar';
		expect(isActive.startsWith('/hello/:id', { id: 'world' })).toBe(false);
	});

	it('should work with a basename', () => {
        base.name = undefined;
		location.pathname = '/my-app/post/123/foo';
		base.name = '/my-app';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
		base.name = undefined;
	});

	it('should work with a basename #', () => {
        base.name = undefined;
		location.pathname = 'C:/path/to/index.html';
		location.hash = '#/post/123/foo';
		base.name = '#';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
		base.name = undefined;
	});
});

describe('isActive.startsWith with base="#"', () => {
	it('should match a simple route', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/about/me';
		expect(isActive.startsWith('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123/foo';
		expect(isActive.startsWith('/post/:id', { id: '123' })).toBe(true);
	});

	it('should match a route with any param', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123/foo';
		expect(isActive.startsWith('/post/:id')).toBe(true);
	});

	it('should match a route with params', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123/comments/456/foo';
		expect(
			isActive.startsWith('/post/:id/comments/:commentId', { id: '123', commentId: '456' }),
		).toBe(true);
	});

	it('should match a route with any params', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/post/123/comments/456/foo';
		expect(isActive.startsWith('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match a simple route', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/foo';
		expect(isActive.startsWith('/hello')).toBe(false);
	});

	it('should not match a route with any param', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/foo/bar';
		expect(isActive.startsWith('/hello/:id')).toBe(false);
	});

	it('should not match a route with params', () => {
        base.name = '#';
        location.pathname = '/C:/path/to/index.html';
		location.hash = '#/foo/bar';
		expect(isActive.startsWith('/hello/:id', { id: 'world' })).toBe(false);
	});
});
