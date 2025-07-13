import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { base } from '../../src/create-router.svelte.js';
import * as preloadModule from '../../src/helpers/preload.js';
import { searchParams } from '../../src/search-params.svelte.js';
import App from './App.test.svelte';

window.scrollTo = vi.fn();

describe('router', () => {
	beforeEach(() => {
		location.pathname = '/';
		location.search = '';
		base.name = undefined;
	});

	it('should render the index route on page load', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should render another route on page load', async () => {
		location.pathname = '/about';
		render(App);
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should navigate to another route', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it.skip('should not navigate if anchor has a target attribute', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('External Posts'));
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should redirect to the correct basename', async () => {
		render(App, { base: 'my-app' });
		expect(location.pathname).toBe('/my-app');
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should navigate with the correct basename', async () => {
		render(App, { base: 'my-app' });
		await userEvent.click(screen.getByText('About'));
		expect(location.pathname).toBe('/my-app/about');
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should scroll to top after navigation', async () => {
		render(App);
		window.scrollY = 100;
		await userEvent.click(screen.getByText('About'));
		expect(window.scrollTo).toHaveBeenCalledWith({
			top: 0,
			left: 0,
			behavior: undefined,
		});
	});

	it('should navigate in beforeLoad', async () => {
		render(App);
		await waitFor(async () => {
			await userEvent.click(screen.getByText('Protected'));
		});
		expect(location.pathname).toBe('/');
	});

	it('should navigate to the latest route even after navigate in before load', async () => {
		render(App);
		await waitFor(async () => {
			await userEvent.click(screen.getByText('Slow Protected'));
		});
		await waitFor(async () => {
			await userEvent.click(screen.getByText('About'));
		});
		await new Promise((resolve) => setTimeout(resolve, 200));
		expect(location.pathname).toBe('/about');
	});

	it('should handle search params', async () => {
		location.search = '?foo=bar&baz=qux';
		render(App);

		// Check initial search params
		await waitFor(() => {
			expect(searchParams.get('foo')).toBe('bar');
			expect(searchParams.get('baz')).toBe('qux');
		});

		// Update search params
		searchParams.set('foo', 'updated');
		expect(location.search).toBe('?foo=updated&baz=qux');

		// Delete a param
		searchParams.delete('baz');
		expect(location.search).toBe('?foo=updated');

		// Navigate with search params
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it.skip('should preload on hover', async () => {
		render(App);
		const fn = vi.spyOn(preloadModule, 'preload');
		await waitFor(() => {
			expect(screen.getByText('Lazy')).toBeInTheDocument();
		});
		const link = screen.getByText('Lazy');
		await userEvent.hover(link);
		await waitFor(() => {
			expect(fn).toHaveBeenCalled();
		});
	});

	// it('params', async () => {
	// 	// Test dynamic route params
	// 	const { createRouter } = await import('../../src/create-router.svelte.js');
	// 	const { createRawSnippet } = await import('svelte');

	// 	const router = createRouter({
	// 		'/': createRawSnippet(() => ({ render: () => '<h1>Home</h1>' })),
	// 		'/user/[id]': createRawSnippet(() => ({
	// 			render: () => `<h1>User ${router.route.params.id}</h1>`,
	// 		})),
	// 		'/post/[category]/[slug]': createRawSnippet(() => ({
	// 			render: () => `<h1>Post: ${router.route.params.category}/${router.route.params.slug}</h1>`,
	// 		})),
	// 	});

	// 	// Navigate to dynamic route
	// 	router.navigate('/user/123');
	// 	expect(router.route.params).toEqual({ id: '123' });

	// 	// Navigate to route with multiple params
	// 	router.navigate('/post/tech/my-post');
	// 	expect(router.route.params).toEqual({ category: 'tech', slug: 'my-post' });

	// 	// Test getParams
	// 	expect(router.route.getParams('/post/tech/my-post')).toEqual({
	// 		category: 'tech',
	// 		slug: 'my-post',
	// 	});

	// 	// Test getParams with non-matching route
	// 	expect(() => router.route.getParams('/non-existent')).toThrow();
	// });

	// it('isActive', async () => {
	// 	const { createRouter } = await import('../../src/create-router.svelte.js');
	// 	const { createRawSnippet } = await import('svelte');

	// 	const router = createRouter({
	// 		'/': createRawSnippet(() => ({ render: () => '<h1>Home</h1>' })),
	// 		'/about': createRawSnippet(() => ({ render: () => '<h1>About</h1>' })),
	// 		'/posts': createRawSnippet(() => ({ render: () => '<h1>Posts</h1>' })),
	// 		'/posts/[id]': createRawSnippet(() => ({ render: () => '<h1>Post</h1>' })),
	// 	});

	// 	// Navigate to home
	// 	router.navigate('/');
	// 	expect(router.isActive('/')).toBe(true);
	// 	expect(router.isActive('/about')).toBe(false);
	// 	expect(router.isActive('/posts')).toBe(false);

	// 	// Navigate to about
	// 	router.navigate('/about');
	// 	expect(router.isActive('/')).toBe(false);
	// 	expect(router.isActive('/about')).toBe(true);
	// 	expect(router.isActive('/posts')).toBe(false);

	// 	// Test with dynamic routes
	// 	router.navigate('/posts/123');
	// 	expect(router.isActive('/posts/123')).toBe(true);
	// 	expect(router.isActive('/posts/456')).toBe(false);
	// 	expect(router.isActive('/posts')).toBe(false);

	// 	// Test with startsWith option
	// 	expect(router.isActive('/posts', { startsWith: true })).toBe(true);
	// 	expect(router.isActive('/post', { startsWith: true })).toBe(true);
	// 	expect(router.isActive('/about', { startsWith: true })).toBe(false);
	// });
});
