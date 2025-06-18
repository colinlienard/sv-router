import { matchRoute } from './match-route.js';
import { resolveRouteComponents } from './utils.js';

/**
 * @param {import('../index.js').Routes} routes
 * @param {string} path
 * @param {import('../index.d.ts').NavigateOptions} options
 */
export async function preload(routes, path, options) {
	const { match, layouts, hooks } = matchRoute(path, routes);
	for (const { onPreload } of hooks) {
		onPreload?.({ pathname: path, ...options });
	}
	await resolveRouteComponents(match ? [...layouts, match] : layouts);
}

const linkSet = new Set();

/** @param {import('../index.js').Routes} routes */
export function preloadOnHover(routes) {
	const observer = new MutationObserver(() => {
		const links = /** @type {NodeListOf<HTMLAnchorElement>} */ (
			document.querySelectorAll('a[data-preload]')
		);
		for (const link of links) {
			if (linkSet.has(link)) continue;
			linkSet.add(link);

			link.addEventListener('mouseenter', function callback() {
				link.removeEventListener('mouseenter', callback);
				const href = link.getAttribute('href');
				if (!href) return;
				const url = new URL(link.href);
				const { replace, state } = link.dataset;
				preload(routes, href, {
					replace: replace === '' || replace === 'true',
					search: url.search,
					state,
					hash: url.hash,
				});
			});
		}
	});

	observer.observe(document.body, {
		subtree: true,
		childList: true,
	});
}
