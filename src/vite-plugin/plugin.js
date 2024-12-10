import path from 'node:path';
import { GEN_CODE_ALIAS, ROUTER_PATH, ROUTES_PATH } from '../common.js';
import { writeRouterCode } from '../gen/write-router-code.js';

/** @returns {import('vite').Plugin} */
export function router() {
	return {
		name: 'sv-router',
		config(config) {
			if (!config.resolve) {
				config.resolve = {};
			}
			if (!config.resolve.alias) {
				config.resolve.alias = {};
			}

			const replacement = path.resolve(process.cwd(), ROUTER_PATH);

			if (Array.isArray(config.resolve.alias)) {
				config.resolve.alias.push({ find: GEN_CODE_ALIAS, replacement });
			} else {
				/** @type {Record<string, string>} */ (config.resolve.alias)[GEN_CODE_ALIAS] = replacement;
			}
		},
		buildStart() {
			writeRouterCode();
		},
		watchChange(file) {
			if (file.includes(ROUTES_PATH)) {
				writeRouterCode();
			}
		},
	};
}
