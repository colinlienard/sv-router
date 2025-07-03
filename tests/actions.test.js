import { render, screen } from '@testing-library/svelte';
import { base, location } from '../src/create-router.svelte.js';
import Actions from './Actions.test.svelte';

vi.mock('../src/create-router.svelte.js', () => ({
	location: {
		pathname: '',
	},
	base: {
		name: undefined,
	},
}));

describe('isActiveLink', () => {
	it('should match a simple route', () => {
		location.pathname = '/about';
		render(Actions, { children: 'About', href: '/about' });
		expect(screen.getByText('About').classList.contains('is-active')).toBe(true);
	});

	it('should match a route with multiple segments', () => {
		location.pathname = '/post/123';
		render(Actions, { children: 'Post 123', href: '/post/123' });
		expect(screen.getByText('Post 123').classList.contains('is-active')).toBe(true);
	});

	it('should not match a route', () => {
		location.pathname = '/team';
		render(Actions, { children: 'About', href: '/about' });
		expect(screen.getByText('About').classList.contains('is-active')).toBe(false);
	});

	it('should work with a basename', () => {
		location.pathname = '/my-app/about';
		base.name = '/my-app';
		render(Actions, { children: 'About', href: '/about' });
		expect(screen.getByText('About').classList.contains('is-active')).toBe(true);
		base.name = undefined;
	});

	it('should set a different class', () => {
		location.pathname = '/about';
		render(Actions, { children: 'About', href: '/about', className: 'custom-class' });
		expect(screen.getByText('About').classList.contains('custom-class')).toBe(true);
	});

	it('should set multiple classes', () => {
		location.pathname = '/about';
		render(Actions, {
			children: 'About',
			href: '/about',
			className: 'custom-class custom-class-2',
		});
		expect(screen.getByText('About').classList.contains('custom-class')).toBe(true);
		expect(screen.getByText('About').classList.contains('custom-class-2')).toBe(true);
	});

	it('should only match the start of the path', () => {
		location.pathname = '/about/team';
		render(Actions, { children: 'About', href: '/about', startsWith: true });
		expect(screen.getByText('About').classList.contains('is-active')).toBe(true);
	});
});
