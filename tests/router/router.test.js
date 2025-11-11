import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { base } from '../../src/create-router.svelte.js';
import { searchParams } from '../../src/search-params.svelte.js';
import App, { isActive, onPreloadMock, route } from './App.test.svelte';

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
		expect(location.pathname).toBe('/about');
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should navigate to the catch-all page', async () => {
		location.pathname = '/not-found';
		render(App);
		await waitFor(() => {
			expect(screen.getByText('404')).toBeInTheDocument();
		});
	});

	it('should not navigate if anchor has a target attribute', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('External'));
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should work with a dynamic route', async () => {
		location.pathname = '/user/123';
		render(App);
		await waitFor(() => {
			expect(screen.getByText('User page 123')).toBeInTheDocument();
		});
		expect(route.params).toEqual({ id: '123' });

		await userEvent.click(screen.getByText('User 456'));
		expect(location.pathname).toBe('/user/456');
		await waitFor(() => {
			expect(screen.getByText('User page 456')).toBeInTheDocument();
		});
		expect(route.params).toEqual({ id: '456' });
	});

	it('should show active page', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Home')).toHaveClass('is-active');
			expect(isActive('/')).toBe(true);
			expect(isActive('/about')).toBe(false);
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About')).toHaveClass('is-active');
			expect(isActive('/')).toBe(false);
			expect(isActive('/about')).toBe(true);
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
		await userEvent.click(screen.getByText('Slow Protected'));
		await userEvent.click(screen.getByText('About'));
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

	it('should preload on hover', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Lazy')).toBeInTheDocument();
		});
		await userEvent.hover(screen.getByText('Lazy'));
		expect(onPreloadMock).toHaveBeenCalled();
	});

	it('should navigate to a lazy route', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('Lazy'));
		expect(location.pathname).toBe('/lazy');
		await waitFor(() => {
			expect(screen.getByText('Lazy Page')).toBeInTheDocument();
		});
	});

	it('should have metadata', async () => {
		location.pathname = '/metadata';
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Metadata Page')).toBeInTheDocument();
			expect(route.meta).toEqual({ title: 'Metadata Page' });
		});
	});

	it('should support object state in navigation', async () => {
		const { navigate } = await import('./App.test.svelte');
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});

		// Navigate with an object state
		const testState = { userId: 123, timestamp: Date.now(), nested: { value: 'test' } };
		navigate('/about', { state: testState });

		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});

		// Verify state is preserved as an object
		expect(route.state).toEqual(testState);
		expect(typeof route.state).toBe('object');
	});

	it('should support string state in navigation for backwards compatibility', async () => {
		const { navigate } = await import('./App.test.svelte');
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});

		// Navigate with a string state
		const testState = 'simple-string-state';
		navigate('/about', { state: testState });

		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});

		// Verify state is preserved as a string
		expect(route.state).toBe(testState);
		expect(typeof route.state).toBe('string');
	});
});

describe('router (hash-based)', () => {
	beforeEach(() => {
		location.pathname = '/';
		location.search = '';
		location.hash = '#/';
		base.name = '#';
	});

	it('should render the index route on page load', async () => {
		render(App, { base: '#' });
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should render another route on page load', async () => {
		location.hash = '#/about';
		render(App, { base: '#' });
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should navigate to another route', async () => {
		render(App, { base: '#' });
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('About'));
		expect(location.hash).toBe('#/about');
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should work with a dynamic route', async () => {
		location.hash = '#/user/123';
		render(App, { base: '#' });
		await waitFor(() => {
			expect(screen.getByText('User page 123')).toBeInTheDocument();
		});
		expect(route.params).toEqual({ id: '123' });

		await userEvent.click(screen.getByText('User 456'));
		expect(location.hash).toBe('#/user/456');
		await waitFor(() => {
			expect(screen.getByText('User page 456')).toBeInTheDocument();
		});
		expect(route.params).toEqual({ id: '456' });
	});

	it('should show active page', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Home')).toHaveClass('is-active');
			expect(isActive('/')).toBe(true);
			expect(isActive('/about')).toBe(false);
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About')).toHaveClass('is-active');
			expect(isActive('/')).toBe(false);
			expect(isActive('/about')).toBe(true);
		});
	});

	it('should navigate to a lazy route', async () => {
		render(App, { base: '#' });
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('Lazy'));
		expect(location.hash).toBe('#/lazy');
		await waitFor(() => {
			expect(screen.getByText('Lazy Page')).toBeInTheDocument();
		});
	});
});
