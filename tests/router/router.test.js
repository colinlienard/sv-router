import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import App from './App.test.svelte';

window.scrollTo = vi.fn();

describe('router', () => {
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
		location.pathname = '/';
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
		await userEvent.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should not navigate if anchor has a target attribute');

	it('should redirect to the correct basename', async () => {
		location.pathname = '/';
		render(App, { base: 'my-app' });
		expect(location.pathname).toBe('/my-app');
		await waitFor(() => {
			expect(screen.getByText('Welcome')).toBeInTheDocument();
		});
	});

	it('should redirect to the correct basename', async () => {
		location.pathname = '/';
		render(App, { base: 'my-app' });
		await userEvent.click(screen.getByText('About'));
		expect(location.pathname).toBe('/my-app/about');
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it('should scroll to top after navigation');

	it('should navigate to the latest route even after before load');

	it('should handle search params');

	it('should preload on hover');

	it('params');

	it('isActive');
});
