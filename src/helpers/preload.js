import { matchRoute } from './match-route.js';
import { parseSearch, resolveRouteComponents, stripBase } from './utils.js';

const PREDICT_CONE_LENGTH = 200;
const PREDICT_CONE_ANGLE = Math.PI / 6;
const PREDICT_TIMEOUT = 50;

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

/** @type {Set<HTMLAnchorElement>} */
const linkSet = new Set();
/** @type {Set<HTMLAnchorElement>} */
const predictedLinks = new Set();

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

	/** @type {ReturnType<typeof setTimeout> | null} */
	let throttleTimer = null;
	function pointerMoveListener(/** @type {PointerEvent} */ event) {
		if (!event.getPredictedEvents || throttleTimer) return;
		throttleTimer = setTimeout(() => {
			throttleTimer = null;
		}, PREDICT_TIMEOUT);

		if (predictedLinks.size === 0) {
			document.removeEventListener('pointermove', pointerMoveListener);
			return;
		}

		const predictedEvents = event.getPredictedEvents();
		const lastPredicted = predictedEvents.at(-1);
		if (!lastPredicted) return;

		const currentX = event.clientX;
		const currentY = event.clientY;
		const dx = lastPredicted.clientX - currentX;
		const dy = lastPredicted.clientY - currentY;

		const distance = Math.hypot(dx, dy);
		if (distance < 2) return;
		const dirX = dx / distance;
		const dirY = dy / distance;

		// Visualize the cone (comment out when not debugging)
		/*
		const canvas = document.createElement('canvas');
		canvas.style.position = 'fixed';
		canvas.style.left = '0';
		canvas.style.top = '0';
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.style.pointerEvents = 'none';
		canvas.style.zIndex = '99999';
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		document.body.append(canvas);
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
		ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(currentX, currentY);
		const leftAngle = Math.atan2(dirY, dirX) - PREDICT_CONE_ANGLE;
		const rightAngle = Math.atan2(dirY, dirX) + PREDICT_CONE_ANGLE;
		const leftX = currentX + Math.cos(leftAngle) * PREDICT_CONE_LENGTH;
		const leftY = currentY + Math.sin(leftAngle) * PREDICT_CONE_LENGTH;
		ctx.lineTo(leftX, leftY);
		ctx.arc(currentX, currentY, PREDICT_CONE_LENGTH, leftAngle, rightAngle, false);
		ctx.lineTo(currentX, currentY);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		setTimeout(() => canvas.remove(), PREDICT_TIMEOUT);
		*/

		outer: for (const link of predictedLinks) {
			if (!link.isConnected) {
				predictedLinks.delete(link);
			}
			const rect = link.getBoundingClientRect();
			const points = [
				{ x: rect.left, y: rect.top },
				{ x: rect.right, y: rect.top },
				{ x: rect.left, y: rect.bottom },
				{ x: rect.right, y: rect.bottom },
				{ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
			];

			for (const point of points) {
				const toPointX = point.x - currentX;
				const toPointY = point.y - currentY;
				const distToPoint = Math.hypot(toPointX, toPointY);
				if (distToPoint > PREDICT_CONE_LENGTH || distToPoint < 0.001) continue;

				const toPointDirX = toPointX / distToPoint;
				const toPointDirY = toPointY / distToPoint;
				const dotProduct = dirX * toPointDirX + dirY * toPointDirY;
				const angle = Math.acos(Math.max(-1, Math.min(1, dotProduct)));

				if (angle <= PREDICT_CONE_ANGLE) {
					anchorPreload(link);
					predictedLinks.delete(link);
					continue outer;
				}
			}
		}
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
				case 'true':
				case 'hover': {
					link.addEventListener('mouseenter', function callback() {
						link.removeEventListener('mouseenter', callback);
						anchorPreload(link);
					});
					break;
				}
				case 'predict': {
					if (predictedLinks.size === 0) {
						document.addEventListener('pointermove', pointerMoveListener);
					}
					predictedLinks.add(link);
					break;
				}
				case 'viewport': {
					intersectionObserver.observe(link);
					break;
				}
				default: {
					console.warn(
						`Unknown preload strategy \`${link.dataset.preload}\` on`,
						link,
						'\nAvailable strategies are: hover, viewport, predict',
					);
					break;
				}
			}

			link.addEventListener('focus', function callback() {
				link.removeEventListener('focus', callback);
				anchorPreload(link);
			});
		}
	});

	observer.observe(document.body, {
		subtree: true,
		childList: true,
	});
}
