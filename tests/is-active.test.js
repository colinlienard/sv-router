import { location } from '../src/create-router.svelte.js';
import { isActive } from '../src/helpers/is-active.js';

vi.mock('../src/create-router.svelte.js', () => ({
	location: {
		pathname: '',
	},
}));

describe('isActive', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it('should match a simple route', () => {
		location.pathname = '/about';
		expect(isActive('/about')).toBe(true);
	});

	it('should match a route with a param', () => {
		location.pathname = '/post/123';
		expect(isActive('/post/:id')).toBe(true);
	});

	it('should match a route with multiple params', () => {
		location.pathname = '/post/123/comments/456';
		expect(isActive('/post/:id/comments/:commentId')).toBe(true);
	});

	it('should not match', () => {
		location.pathname = '/foo';
		expect(isActive('/hello')).toBe(false);
	});

	it('should not match either', () => {
		location.pathname = '/foo/bar';
		expect(isActive('/hello/world')).toBe(false);
	});
});
