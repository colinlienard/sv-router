import { matchRoute } from './match-route.js';
import { resolveRouteComponents } from './utils.js';

/**
 * @param {import('../index.js').Routes} routes
 * @param {string} path
 * @param {import('../index.d.ts').NavigateOptions} [options]
 */
export async function preload(routes, path, options) {
	const pathname = new URL(path, globalThis.location.origin).pathname;
	const { match, layouts, hooks, meta } = matchRoute(pathname, routes);
	for (const { onPreload } of hooks) {
		void onPreload?.({ pathname, meta, ...options });
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
				const url = new URL(link.href, globalThis.location.origin);
				const { replace, state } = link.dataset;
				void preload(routes, url.pathname, {
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
