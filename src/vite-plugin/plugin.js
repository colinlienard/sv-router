import path from 'node:path';
import { genConfig } from '../gen/gen-config.js';
import { writeRouterCode } from '../gen/write-router-code.js';

/**
 * @param {import('./index.d.ts').RouterOptions | undefined} options
 * @returns {import('vite').Plugin}
 */
export function router(options) {
	if (options?.path) {
		genConfig.routesPath = options.path;
	}

	return {
		name: 'sv-router',
		config(config) {
			if (!config.resolve) {
				config.resolve = {};
			}
			if (!config.resolve.alias) {
				config.resolve.alias = {};
			}

			const replacement = path.resolve(process.cwd(), genConfig.routerPath);

			if (Array.isArray(config.resolve.alias)) {
				config.resolve.alias.push({ find: genConfig.genCodeAlias, replacement });
			} else {
				/** @type {Record<string, string>} */ (config.resolve.alias)[genConfig.genCodeAlias] =
					replacement;
			}
		},
		buildStart() {
			writeRouterCode();
		},
		watchChange(file) {
			if (file.includes(genConfig.routesPath)) {
				writeRouterCode();
			}
		},
	};
}
