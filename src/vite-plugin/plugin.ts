import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { generateRouterCode } from './generate-router-code.ts';

const ROUTES_PATH = 'src/routes/';
const ROUTER_DIR_PATH = '.sv-router';
const ROUTER_PATH = ROUTER_DIR_PATH + '/router.ts';
const TSCONFIG_PATH = ROUTER_DIR_PATH + '/tsconfig.json';
const GENERATED_CODE_ALIAS = 'sv-router/generated';

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
				config.resolve.alias.push({ find: GENERATED_CODE_ALIAS, replacement });
			} else {
				config.resolve.alias[GENERATED_CODE_ALIAS] = replacement;
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

function writeRouterCode() {
	if (!fs.existsSync(ROUTER_DIR_PATH)) {
		fs.mkdirSync(ROUTER_DIR_PATH);
	}

	const routerCode = generateRouterCode(ROUTES_PATH);
	fs.writeFileSync(ROUTER_PATH, routerCode);

	const tsConfig = {
		compilerOptions: {
			module: 'Preserve',
			moduleResolution: 'Bundler',
			paths: {
				GENERATED_CODE_ALIAS: ['../' + ROUTER_PATH],
			},
		},
		include: ['./router.ts'],
	};
	fs.writeFileSync(TSCONFIG_PATH, JSON.stringify(tsConfig, undefined, 2));
}
