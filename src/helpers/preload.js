import { matchRoute } from './match-route.js';
import { parseSearch, resolveRouteComponents, stripBase } from './utils.js';

/**
 * @param {import('../index.js').Routes} routes
 * @param {string} path
 * @param {import('../index.d.ts').NavigateOptions} [options]
 */
export async function preload(routes, path, options) {
	const { match, layouts, hooks, meta } = matchRoute(path, routes);
	for (const { onPreload } of hooks) {
		void onPreload?.({
			pathname: path,
			meta,
			...options,
			search: parseSearch(options?.search),
		});
	}
	await resolveRouteComponents(match ? [...layouts, match] : layouts);
}

const linkSet = new Set();
const predictedLinks = new WeakSet();
let predictListener = null;

/** @param {import('../index.js').Routes} routes */
export function preloadOnHover(routes) {
	/** @param {HTMLAnchorElement} link */
	function anchorPreload(link) {
		const href = link.getAttribute('href');
		if (!href) return;
		const url = new URL(link.href);
		const pathname = stripBase(url.pathname);
		const { replace, state } = link.dataset;
		preload(routes, pathname, {
			replace: replace === '' || replace === 'true',
			search: url.search,
			state,
			hash: url.hash,
		});
	}

	const intersectionObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				intersectionObserver.unobserve(entry.target);
				anchorPreload(/** @type {HTMLAnchorElement} */ (entry.target));
			}
		}
	});

	const observer = new MutationObserver(() => {
		const links = /** @type {NodeListOf<HTMLAnchorElement>} */ (
			document.querySelectorAll('a[data-preload]')
		);

		for (const link of links) {
			if (linkSet.has(link)) continue;
			linkSet.add(link);

			switch (link.dataset.preload) {
				case '':
				case 'hover': {
					link.addEventListener('mouseenter', function callback() {
						link.removeEventListener('mouseenter', callback);
						anchorPreload(link);
					});
					break;
				}
				case 'predict': {
					// Set up predict listener if not already active
					if (!predictListener) {
						predictListener = (/** @type {PointerEvent} */ event) => {
							// Check if getPredictedEvents is available
							if (!event.getPredictedEvents) return;

							const predictedEvents = event.getPredictedEvents();
							if (predictedEvents.length < 2) return;

							// Calculate trajectory from current position to last predicted position
							const currentX = event.clientX;
							const currentY = event.clientY;
							const lastPredicted = predictedEvents.at(-1);

							// Calculate velocity vector
							const dx = lastPredicted.clientX - currentX;
							const dy = lastPredicted.clientY - currentY;

							// If movement is too small, ignore
							const distance = Math.hypot(dx, dy);
							if (distance < 2) return;

							// Normalize and extend the trajectory
							const projectionDistance = 200; // How far ahead to look
							const steps = 10; // Number of points to check along the trajectory
							const detectionRadius = 30; // Radius around each point to check for links

							for (let i = 1; i <= steps; i++) {
								const t = i / steps;
								const projectedX = currentX + (dx / distance) * projectionDistance * t;
								const projectedY = currentY + (dy / distance) * projectionDistance * t;

								const ok = document.createElement('div');
								document.body.append(ok);
								ok.style.position = 'absolute';
								ok.style.left = `${projectedX}px`;
								ok.style.top = `${projectedY}px`;
								ok.style.width = '10px';
								ok.style.height = '10px';
								ok.style.backgroundColor = 'red';
								ok.style.borderRadius = '50%';
								ok.style.pointerEvents = 'none';
								ok.style.zIndex = '9999';
								setTimeout(() => {
									ok.remove();
								}, 1000);

								// Check in a radius around the projected point
								const predictLinks = /** @type {NodeListOf<HTMLAnchorElement>} */ (
									document.querySelectorAll('a[data-preload="predict"]')
								);

								for (const link of predictLinks) {
									if (predictedLinks.has(link)) continue;

									const rect = link.getBoundingClientRect();
									const linkCenterX = rect.left + rect.width / 2;
									const linkCenterY = rect.top + rect.height / 2;

									// Check if projected point is near the link
									const distToLink = Math.sqrt(
										Math.pow(projectedX - linkCenterX, 2) + Math.pow(projectedY - linkCenterY, 2),
									);

									// Check if link is within detection radius or if trajectory passes through link bounds
									const expandedBounds = {
										left: rect.left - detectionRadius,
										right: rect.right + detectionRadius,
										top: rect.top - detectionRadius,
										bottom: rect.bottom + detectionRadius,
									};

									if (
										distToLink < detectionRadius ||
										(projectedX >= expandedBounds.left &&
											projectedX <= expandedBounds.right &&
											projectedY >= expandedBounds.top &&
											projectedY <= expandedBounds.bottom)
									) {
										predictedLinks.add(link);
										anchorPreload(link);
									}
								}
							}
						};

						// Add throttled listener for better performance
						let throttleTimer = null;
						const throttledListener = (/** @type {PointerEvent} */ event) => {
							if (throttleTimer) return;
							throttleTimer = setTimeout(() => {
								throttleTimer = null;
							}, 50); // Throttle to every 50ms for better responsiveness
							predictListener(event);
						};

						document.addEventListener('pointermove', throttledListener);
					}
					break;
				}
				case 'viewport': {
					intersectionObserver.observe(link);
					break;
				}
				default: {
					console.warn(`Unknown preload strategy \`${link.dataset.preload}\` on`, link);
					break;
				}
			}
		}
	});

	observer.observe(document.body, {
		subtree: true,
		childList: true,
	});
}
