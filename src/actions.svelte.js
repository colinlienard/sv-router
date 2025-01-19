import { location } from './create-router.svelte.js';

/** @type {import('./index.d.ts').IsActiveLink} */
export function isActiveLink(node, { className = 'is-active' } = {}) {
	if (node.tagName !== 'A') {
		throw new Error('isActiveLink can only be used on <a> elements');
	}

	$effect(() => {
		const pathname = new URL(node.href).pathname;
		if (pathname === location.pathname) {
			node.classList.add(className);
		} else {
			node.classList.remove(className);
		}
	});
}
