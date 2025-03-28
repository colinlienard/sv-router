import { constructPath, join } from '../src/helpers/utils.js';

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
