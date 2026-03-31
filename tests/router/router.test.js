import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, vi } from 'vitest';
import { base, blockNavigation, onBeforeUnload } from '../../src/create-router.svelte.js';
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

	it('should await the full redirect chain when navigate triggers a redirect', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await navigate('/protected');
		expect(location.pathname).toBe('/');
		expect(screen.getByText('Welcome')).toBeInTheDocument();
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

describe('router (navigation options)', () => {
	beforeEach(() => {
		location.pathname = '/';
		location.search = '';
		base.name = undefined;
	});

	it('should navigate with history.go when passing a number', async () => {
		const goSpy = vi.spyOn(globalThis.history, 'go');
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await navigate(-1);
		expect(goSpy).toHaveBeenCalledWith(-1);
		goSpy.mockRestore();
	});

	it('should navigate with a hash option', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await navigate('/about', { hash: 'section' });
		expect(location.pathname).toBe('/about');
		expect(location.hash).toBe('#section');
	});

	it('should navigate with replace option', async () => {
		const replaceStateSpy = vi.spyOn(globalThis.history, 'replaceState');
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await navigate('/about', { replace: true });
		expect(replaceStateSpy).toHaveBeenCalled();
		replaceStateSpy.mockRestore();
	});

	it('should navigate with state', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await navigate('/about', { state: { foo: 'bar' } });
		expect(route.state).toEqual({ foo: 'bar' });
	});

	it('should not navigate on anchor with download attribute', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const link = document.createElement('a');
		link.href = '/about';
		link.download = '';
		link.textContent = 'Download';
		document.body.append(link);
		await userEvent.click(link);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		link.remove();
	});

	it('should not navigate on anchor with hash-only href', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const link = document.createElement('a');
		link.setAttribute('href', '#section');
		link.textContent = 'Hash Link';
		document.body.append(link);
		await userEvent.click(link);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		link.remove();
	});

	it('should navigate with data-state on link', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const link = document.createElement('a');
		link.href = '/about';
		link.textContent = 'Stateful';
		link.dataset.state = JSON.stringify({ custom: true });
		document.body.append(link);
		await userEvent.click(link);
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		expect(route.state).toEqual({ custom: true });
		link.remove();
	});

	it('should handle non-JSON data-state as a string', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const link = document.createElement('a');
		link.href = '/about';
		link.textContent = 'String State';
		link.dataset.state = 'plain-string';
		document.body.append(link);
		await userEvent.click(link);
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		expect(route.state).toBe('plain-string');
		link.remove();
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
		const clear = blockNavigation(() => false);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
	});

	it('should block link navigation when one of callbacks returns false', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(() => false);
		const clear2 = blockNavigation(() => true);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
		clear2();
	});

	it('should block link navigation when async callback returns false', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(async () => {
			return await new Promise((resolve) => {
				setTimeout(() => resolve(false), 250);
			});
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
	});

	it('should allow link navigation when async callback returns true', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(async () => {
			return await new Promise((resolve) => {
				setTimeout(() => resolve(true), 250);
			});
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		clear();
	});

	it('should block link navigation when object callback returns false after promise resolves', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation({
			beforeUnload() {
				return true;
			},
			async onNavigate() {
				return await new Promise((resolve) => {
					setTimeout(() => resolve(false), 250);
				});
			},
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
	});

	it('should block programmatic navigation when callback returns false', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(() => false);
		navigate('/about');
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
	});

	it('should allow navigation when callback returns true', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(() => true);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		clear();
	});

	it('should allow navigation when all callbacks return true', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(() => true);
		const clear2 = blockNavigation(() => true);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		clear();
		clear2();
	});

	it('should allow navigation when callback returns true after promise resolves', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation({
			beforeUnload() {
				return true;
			},
			async onNavigate() {
				return await new Promise((resolve) => {
					setTimeout(() => resolve(true), 250);
				});
			},
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		clear();
	});

	it('should unblock navigation after cleanup function is called', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(() => false);
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should not add extra history entries on programmatic navigation with blockers', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		const clear = blockNavigation(() => true);
		const before = history.length;
		navigate('/about');
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		expect(history.length).toBe(before + 1);
		clear();
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
		const clear = blockNavigation(() => false);
		globalThis.dispatchEvent(new PopStateEvent('popstate'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		clear();
	});

	it('should not corrupt history when blocking popstate back navigation', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
		});
		const lengthBefore = history.length;
		const clear = blockNavigation(() => false);
		history.back();
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
		expect(history.length).toBe(lengthBefore);
		clear();
	});

	it('should allow popstate navigation after blocker returns true', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(location.pathname).toBe('/about');
		});
		const clear = blockNavigation(() => true);
		// Simulate back navigation: change URL and dispatch popstate with previous index
		const prevIndex = (history.state?._routerIndex ?? 1) - 1;
		history.replaceState({ _routerIndex: prevIndex, _userState: null }, '', '/');
		globalThis.dispatchEvent(new PopStateEvent('popstate'));
		await waitFor(() => {
			expect(location.pathname).toBe('/');
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		clear();
	});

	it('should call event.preventDefault when object blocker beforeUnload returns false', () => {
		const clear = blockNavigation({
			beforeUnload() {
				return false;
			},
			onNavigate() {
				return true;
			},
		});
		const event = new Event('beforeunload');
		event.preventDefault = vi.fn();
		onBeforeUnload(/** @type {BeforeUnloadEvent} */ (event));
		expect(event.preventDefault).toHaveBeenCalled();
		clear();
	});

	it('should not call event.preventDefault when object blocker beforeUnload returns true', () => {
		const clear = blockNavigation({
			beforeUnload() {
				return true;
			},
			onNavigate() {
				return true;
			},
		});
		const event = new Event('beforeunload');
		event.preventDefault = vi.fn();
		onBeforeUnload(/** @type {BeforeUnloadEvent} */ (event));
		expect(event.preventDefault).not.toHaveBeenCalled();
		clear();
	});

	it('should ignore function-form blockers in onBeforeUnload', () => {
		const clear = blockNavigation(() => false);
		const event = new Event('beforeunload');
		event.preventDefault = vi.fn();
		onBeforeUnload(/** @type {BeforeUnloadEvent} */ (event));
		expect(event.preventDefault).not.toHaveBeenCalled();
		clear();
	});

	it('should ignore async function-form blockers in onBeforeUnload', () => {
		const clear = blockNavigation(async () => false);
		const event = new Event('beforeunload');
		event.preventDefault = vi.fn();
		onBeforeUnload(/** @type {BeforeUnloadEvent} */ (event));
		expect(event.preventDefault).not.toHaveBeenCalled();
		clear();
	});
});

describe('router (dynamic routes)', () => {
	beforeEach(() => {
		location.pathname = '/';
		location.search = '';
		base.name = undefined;
	});

	it('should navigate to a dynamically added route and fall back when removed', async () => {
		const {
			default: DynamicApp,
			navigate: nav,
			setYoloRoute,
		} = await import('./DynamicRoutes.test.svelte');

		render(DynamicApp);
		await waitFor(() => {
			expect(screen.getByText('Not Found')).toBeInTheDocument();
		});

		// Navigate to /foo — should work since it's in the initial routes
		await nav('/foo');
		await waitFor(() => {
			expect(screen.getByText('Foo Page')).toBeInTheDocument();
		});

		// /yolo is not defined yet — should show catch-all
		await nav('/yolo');
		await waitFor(() => {
			expect(screen.getByText('Not Found')).toBeInTheDocument();
		});

		// Dynamically add /yolo
		setYoloRoute(true);
		await nav('/yolo');
		await waitFor(() => {
			expect(screen.getByText('Yolo Page')).toBeInTheDocument();
		});

		// Navigate away and back to confirm it still works
		await nav('/bar');
		await waitFor(() => {
			expect(screen.getByText('Bar Page')).toBeInTheDocument();
		});
		await nav('/yolo');
		await waitFor(() => {
			expect(screen.getByText('Yolo Page')).toBeInTheDocument();
		});

		// Dynamically remove /yolo
		setYoloRoute(false);
		await nav('/yolo');
		await waitFor(() => {
			expect(screen.getByText('Not Found')).toBeInTheDocument();
		});
	});
});
