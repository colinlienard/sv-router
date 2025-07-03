import { clsx } from 'clsx';
import { base, location } from './create-router.svelte.js';
import { join } from './helpers/utils.js';

/** @type {import('./index.d.ts').IsActiveLink} */
export function isActiveLink(
	node,
	{ class: classValue = 'is-active', className, startsWith = false } = {},
) {
	if (node.tagName !== 'A') {
		throw new Error('isActiveLink can only be used on <a> elements');
	}

	$effect(() => {
		let pathname = new URL(node.href).pathname;
		if (base.name) {
			pathname = join(base.name, pathname);
		}
		const tokens = (className ?? clsx(classValue)).split(' ').filter((token) =>  token.length > 0);
		if (startsWith ? location.pathname.startsWith(pathname) : location.pathname === pathname) {
			node.classList.add(...tokens);
		} else {
			node.classList.remove(...tokens);
		}
	});
}
