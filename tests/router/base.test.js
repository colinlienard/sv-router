import { base, createRouter } from '../../src/create-router.svelte.js';

const Dummy = /** @type {import('svelte').Component} */ (() => {});

describe('createRouter base option', () => {
	beforeEach(() => {
		history.replaceState(null, '', '/');
		base.name = undefined;
	});

	afterEach(() => {
		base.name = undefined;
	});

	it('should apply the base as soon as createRouter is called, before <Router> renders', () => {
		const { p, isActive } = createRouter({ '/': Dummy, '/about': Dummy }, { base: 'my-app' });
		expect(base.name).toBe('/my-app');
		expect(p('/about')).toBe('/my-app/about');
		expect(isActive('/')).toBe(true);
	});

	it('should prepend the base to the current URL', () => {
		createRouter({ '/': Dummy }, { base: 'my-app' });
		expect(location.pathname).toBe('/my-app');
	});

	it('should support hash-based routing', () => {
		const { p } = createRouter({ '/': Dummy, '/about': Dummy }, { base: '#' });
		expect(base.name).toBe('#');
		expect(p('/about')).toBe('/#/about');
		expect(location.hash).toBe('#/');
	});
});
