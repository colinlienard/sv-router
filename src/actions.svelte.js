import { base, location } from './create-router.svelte.js';
import { join } from './helpers/utils.js';

/** @type {import('./index.d.ts').IsActiveLink} */
export function isActiveLink(node, { className = 'is-active', startsWith = false } = {}) {
	if (node.tagName !== 'A') {
		throw new Error('isActiveLink can only be used on <a> elements');
	}

	$effect(() => {
		let pathname;
		if (base.name === '#') {
			pathname = new URL(node.href).hash.slice(1);
		} else {
			pathname = new URL(node.href).pathname;
			if (base.name) {
				pathname = join(base.name, pathname);
			}
		}
		const tokens = className.split(' ').filter(Boolean) ?? [];
		if (startsWith ? location.pathname.startsWith(pathname) : location.pathname === pathname) {
			node.classList.add(...tokens);
		} else {
			node.classList.remove(...tokens);
		}
	});
}
