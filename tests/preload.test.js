import { render, screen, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import { base } from '../src/create-router.svelte.js';
import App, { onPreloadMock, preload } from './router/App.test.svelte';

window.scrollTo = vi.fn();

beforeEach(() => {
	location.pathname = '/';
	location.search = '';
	base.name = undefined;
	onPreloadMock.mockClear();
});

async function renderApp() {
	render(App);
	await waitFor(() => {
		expect(screen.getByText('Welcome')).toBeInTheDocument();
	});
}

/** @param {string} strategy @param {{ href?: string }} [options] */
function createPreloadLink(strategy, { href = '/about' } = {}) {
	const link = document.createElement('a');
	if (href) link.href = href;
	link.dataset.preload = strategy;
	document.body.append(link);
	return link;
}

describe('preload', () => {
	it('should call onPreload hook when preloading a route', async () => {
		await renderApp();
		await preload('/lazy');
		expect(onPreloadMock).toHaveBeenCalled();
	});

	it('should preload without errors for routes without hooks', async () => {
		await renderApp();
		await preload('/about');
	});
});

describe('preloadOnHover', () => {
	it('should preload on focus for accessibility', async () => {
		render(App);
		await waitFor(() => {
			expect(screen.getByText('Lazy')).toBeInTheDocument();
		});
		const lazyLink = screen.getByText('Lazy');
		lazyLink.dispatchEvent(new FocusEvent('focus'));
		await waitFor(() => {
			expect(onPreloadMock).toHaveBeenCalled();
		});
	});

	it('should warn for unknown preload strategies', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		await renderApp();
		const link = createPreloadLink('invalid-strategy');
		await waitFor(() => {
			expect(warnSpy).toHaveBeenCalledWith(
				expect.stringContaining('Unknown preload strategy'),
				link,
				expect.any(String),
			);
		});
		warnSpy.mockRestore();
		link.remove();
	});

	it('should set up viewport observer for data-preload="viewport"', async () => {
		const observeSpy = vi.spyOn(IntersectionObserver.prototype, 'observe');
		await renderApp();
		const link = createPreloadLink('viewport');
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(observeSpy).toHaveBeenCalledWith(link);
		observeSpy.mockRestore();
		link.remove();
	});

	it('should add pointermove listener for data-preload="predict"', async () => {
		const addEventSpy = vi.spyOn(document, 'addEventListener');
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(addEventSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
		addEventSpy.mockRestore();
		link.remove();
	});

	it('should preload predict link when pointer moves toward it', async () => {
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 50));
		vi.spyOn(link, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 50, 20));
		const event = new PointerEvent('pointermove', { clientX: 50, clientY: 110 });
		Object.defineProperty(event, 'getPredictedEvents', {
			value: () => [{ clientX: 150, clientY: 110 }],
		});
		document.dispatchEvent(event);
		link.remove();
		vi.restoreAllMocks();
	});

	it('should skip predict when pointer barely moves', async () => {
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 100));
		const event = new PointerEvent('pointermove', { clientX: 50, clientY: 50 });
		Object.defineProperty(event, 'getPredictedEvents', {
			value: () => [{ clientX: 51, clientY: 50 }],
		});
		document.dispatchEvent(event);
		link.remove();
	});

	it('should skip predict when getPredictedEvents returns empty', async () => {
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 100));
		const event = new PointerEvent('pointermove', { clientX: 50, clientY: 50 });
		Object.defineProperty(event, 'getPredictedEvents', { value: () => [] });
		document.dispatchEvent(event);
		link.remove();
	});

	it('should skip predict when event has no getPredictedEvents', async () => {
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 100));
		const event = new PointerEvent('pointermove', { clientX: 50, clientY: 50 });
		document.dispatchEvent(event);
		link.remove();
	});

	it('should not preload predict link when pointer moves away from it', async () => {
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 100));
		vi.spyOn(link, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 100, 50, 20));
		const event = new PointerEvent('pointermove', { clientX: 200, clientY: 110 });
		Object.defineProperty(event, 'getPredictedEvents', {
			value: () => [{ clientX: 300, clientY: 110 }],
		});
		document.dispatchEvent(event);
		link.remove();
		vi.restoreAllMocks();
	});

	it('should clean up disconnected predict links', async () => {
		await renderApp();
		const link = createPreloadLink('predict');
		await new Promise((resolve) => setTimeout(resolve, 100));
		link.remove();
		const event = new PointerEvent('pointermove', { clientX: 50, clientY: 50 });
		Object.defineProperty(event, 'getPredictedEvents', {
			value: () => [{ clientX: 150, clientY: 50 }],
		});
		document.dispatchEvent(event);
	});

	it('should preload with data-preload="true"', async () => {
		await renderApp();
		const link = createPreloadLink('true');
		await new Promise((resolve) => setTimeout(resolve, 0));
		link.dispatchEvent(new MouseEvent('mouseenter'));
	});

	it('should not preload links without href', async () => {
		await renderApp();
		const link = createPreloadLink('', { href: undefined });
		await new Promise((resolve) => setTimeout(resolve, 0));
		link.dispatchEvent(new MouseEvent('mouseenter'));
		link.remove();
	});
});
