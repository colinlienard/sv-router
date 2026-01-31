import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { base, blockNavigation } from '../../src/create-router.svelte.js';
import { searchParams } from '../../src/search-params.svelte.js';
import App, { isActive, navigate, onPreloadMock, route } from './App.test.svelte';

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

	it('should navigate to another route programmatically', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		navigate('/about');
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
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

	it('should match with a dynamic route', async () => {
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
		await waitFor(() => {
			expect(onPreloadMock).toHaveBeenCalled();
		});
	});

	it('should navigate to a lazy route', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('Lazy'));
		await waitFor(() => {
			expect(location.pathname).toBe('/lazy');
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

	it('should navigate to another route programmatically', async () => {
		render(App, { base: '#' });
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		navigate('/about');
		await waitFor(() => {
			expect(location.hash).toBe('#/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should match with a dynamic route', async () => {
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
		await waitFor(() => {
			expect(location.hash).toBe('#/lazy');
			expect(screen.getByText('Lazy Page')).toBeInTheDocument();
		});
	});
});

describe('blockNavigation', () => {
	beforeEach(() => {
		location.pathname = '/';
		location.search = '';
		base.name = undefined;
	});

	it('should block link navigation when callback returns false', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		blockNavigation(() => false);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should block programmatic navigation when callback returns false', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		blockNavigation(() => false);
		navigate('/about');
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should allow navigation when callback returns true', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		blockNavigation(() => true);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should clear blocker after allowing navigation', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		blockNavigation(() => true);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('Home'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should block popstate navigation when callback returns false', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
		});
		blockNavigation(() => false);
		globalThis.dispatchEvent(new PopStateEvent('popstate'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});
});
