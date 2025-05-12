import { matchRoute } from './match-route.js';
import { resolveRouteComponents } from './utils.js';

/**
 * @param {import('../index.js').Routes} routes
 * @param {string} path
 */
export async function preload(routes, path) {
	const { match, layouts } = matchRoute(path, routes);
	await resolveRouteComponents(match ? [...layouts, match] : layouts);
}

const linkSet = new Set();

/** @param {import('../index.js').Routes} routes */
export function preloadOnHover(routes) {
	const observer = new MutationObserver(() => {
		const links = document.querySelectorAll('a[data-preload]');
		for (const link of links) {
			if (linkSet.has(link)) continue;
			linkSet.add(link);

			link.addEventListener('mouseenter', function callback() {
				link.removeEventListener('mouseenter', callback);
				const href = link.getAttribute('href');
				if (!href) return;
				const { match, layouts } = matchRoute(href, routes);
				resolveRouteComponents(match ? [...layouts, match] : layouts);
			});
		}
	});

	observer.observe(document.body, {
		subtree: true,
		childList: true,
	});
}
