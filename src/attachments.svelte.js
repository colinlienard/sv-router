import { base, location } from './create-router.svelte.js';
import { comparePathParts, toPathParts } from './helpers/utils.js';

/** @type {import('./index.d.ts').IsActiveLink} */
export function isActiveLink({ className = 'is-active', startsWith = false } = {}) {
	return (node) => {
		if (node.tagName !== 'A') {
			throw new Error('isActiveLink can only be used on <a> elements');
		}

		$effect(() => {
			let pathname;
			if (base.name === '#') {
				pathname = new URL(node.href).hash.slice(1);
			} else {
				pathname = new URL(node.href).pathname;
			}
			const tokens = className.split(' ').filter(Boolean) ?? [];
			// Both sides already include the base, so there is no need to strip it.
			const isActive = comparePathParts(
				toPathParts(pathname),
				toPathParts(location.pathname),
				startsWith,
			);
			if (isActive) {
				node.classList.add(...tokens);
			} else {
				node.classList.remove(...tokens);
			}
		});
	};
}
