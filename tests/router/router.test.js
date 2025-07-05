import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import App from './App.test.svelte';

window.scrollTo = vi.fn();

const location = {
	href: 'http://localhost:3000/',
	pathname: '/',
	search: '',
	hash: '',
	origin: 'http://localhost:3000',
	protocol: 'http:',
	host: 'localhost:3000',
	hostname: 'localhost',
	port: '3000',
	assign: vi.fn(),
	replace: vi.fn(),
	reload: vi.fn(),
};

const history = {
	pushState: vi.fn((state, _, to) => {
		location.pathname = to;
	}),
};

vi.stubGlobal('location', location);
vi.stubGlobal('history', history);

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
		const user = userEvent.setup();
		await user.click(screen.getByText('About'));
		await waitFor(() => {
			expect(screen.getByText('About Us')).toBeInTheDocument();
		});
	});

	it.todo('should redirect to the correct basename');

	it.todo('should navigate with a basename');
});
