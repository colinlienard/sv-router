import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { generateRouterCode } from '../gen/generate-router-code.ts';

const ROUTES_PATH = 'src/routes';
const GEN_CODE_DIR_PATH = '.router';
const ROUTER_PATH = path.join(GEN_CODE_DIR_PATH, '/router.ts');
const TSCONFIG_PATH = path.join(GEN_CODE_DIR_PATH, '/tsconfig.json');
const GEN_CODE_ALIAS = 'sv-router/generated';

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

function writeRouterCode() {
	if (!fs.existsSync(GEN_CODE_DIR_PATH)) {
		fs.mkdirSync(GEN_CODE_DIR_PATH);
	}

	const routerCode = generateRouterCode(ROUTES_PATH);
	writeFileIfDifferent(ROUTER_PATH, routerCode);

	const tsConfig = {
		compilerOptions: {
			module: 'Preserve',
			moduleResolution: 'Bundler',
			paths: {
				[GEN_CODE_ALIAS]: [path.join('..', ROUTER_PATH)],
			},
		},
		include: ['./router.ts'],
	};
	writeFileIfDifferent(TSCONFIG_PATH, JSON.stringify(tsConfig, undefined, 2));
}

function writeFileIfDifferent(filePath: string, content: string) {
	if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
		fs.writeFileSync(filePath, content);
	}
}
