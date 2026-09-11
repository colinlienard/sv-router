import { base, location } from './create-router.svelte.js';
import { comparePathParts, toPathParts } from './helpers/utils.js';

/** @type {import('./index.d.ts').IsActiveLink} */
export function isActiveLink({ className = 'is-active', startsWith = false } = {}) {
	return (node) => {
		if (node.tagName !== 'A') {
			throw new Error('isActiveLink can only be used on <a> elements');
		}

		$effect(() => {
			const url = new URL(node.href);
			const pathname = base.name === '#' ? url.hash.slice(1) : url.pathname;
			const tokens = className.split(' ').filter(Boolean);
			const isActive =
				pathname !== '' &&
				comparePathParts(toPathParts(pathname), toPathParts(location.pathname), startsWith);
			if (isActive) {
				node.classList.add(...tokens);
			} else {
				node.classList.remove(...tokens);
			}
		});
	};
}
