import path from 'node:path';
import type { Plugin } from 'vite';
import { GEN_CODE_ALIAS, ROUTER_PATH, ROUTES_PATH } from '../common.ts';
import { writeRouterCode } from '../gen/write-router-code.ts';

export function router(): Plugin {
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
				(config.resolve.alias as Record<string, string>)[GEN_CODE_ALIAS] = replacement;
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
