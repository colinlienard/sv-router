import { base } from '../src/create-router.svelte.js';
import {
	constructPath,
	constructUrl,
	join,
	parseSearch,
	serializeSearch,
} from '../src/helpers/utils.js';

describe('constructPath', () => {
	it('should return the original path when no params are provided', () => {
		const result = constructPath('/posts');
		expect(result).toBe('/posts');
	});

	it('should replace a single param in the path', () => {
		const result = constructPath('/posts/:id', { id: '123' });
		expect(result).toBe('/posts/123');
	});

	it('should replace multiple params in the path', () => {
		const result = constructPath('/posts/:id/comments/:commentId', { id: '123', commentId: '456' });
		expect(result).toBe('/posts/123/comments/456');
	});
});

describe('constructPath (hash-based)', () => {
	beforeEach(() => {
		base.name = '#';
	});

	it('should return the original path when no params are provided', () => {
		const result = constructPath('/posts');
		expect(result).toBe('http://localhost:3000/#/posts');
	});

	it('should replace a single param in the path', () => {
		const result = constructPath('/posts/:id', { id: '123' });
		expect(result).toBe('http://localhost:3000/#/posts/123');
	});

	it('should replace multiple params in the path', () => {
		const result = constructPath('/posts/:id/comments/:commentId', { id: '123', commentId: '456' });
		expect(result).toBe('http://localhost:3000/#/posts/123/comments/456');
	});
});

describe('constructUrl', () => {
	it('should create a path with search and hash', () => {
		const result = constructUrl('/posts', {
			search: { q: 'test' },
			hash: 'hash',
		});
		expect(result).toBe('http://localhost:3000/#/posts?q=test#hash');
	});
});

describe('join', () => {
	it('should join path parts correctly', () => {
		const result = join('/posts', '/comments');
		expect(result).toBe('/posts/comments');
	});

	it('should handle trailing slashes correctly', () => {
		const result = join('posts/', 'comments/');
		expect(result).toBe('/posts/comments');
	});

	it('should add a leading slash if no parts have one', () => {
		const result = join('posts', 'comments');
		expect(result).toBe('/posts/comments');
	});

	it('should handle both leading and trailing slashes correctly', () => {
		const result = join('posts/', '/comments/', 'latest/', 'response');
		expect(result).toBe('/posts/comments/latest/response');
	});
});

describe('serializeSearch', () => {
	it('should transform an object into a query string', () => {
		const result = serializeSearch({ q: 'test', page: 2, ok: true });
		expect(result).toBe('?q=test&page=2&ok=true');
	});

	it('should add a `?` if the input is a string', () => {
		const result = serializeSearch('q=test');
		expect(result).toBe('?q=test');
	});
});

describe('parseSearch', () => {
	it('should transform a query string into an object', () => {
		const result = parseSearch('?q=test&page=2&ok=true');
		expect(result).toEqual({ q: 'test', page: 2, ok: true });
	});
});
