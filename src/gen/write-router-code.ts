/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import {
	GEN_CODE_ALIAS,
	GEN_CODE_DIR_PATH,
	ROUTER_PATH,
	ROUTES_PATH,
	TSCONFIG_PATH,
} from '../common.ts';
import { generateRouterCode } from './generate-router-code.ts';

export function writeRouterCode() {
	try {
		if (!fs.existsSync(GEN_CODE_DIR_PATH)) {
			fs.mkdirSync(GEN_CODE_DIR_PATH);
		}

		// Write `.router/router.ts` file
		const routerCode = generateRouterCode(ROUTES_PATH);
		writeFileIfDifferent(ROUTER_PATH, routerCode);

		// Write `.router/tsconfig.json` file
		const tsConfig = {
			compilerOptions: {
				module: 'preserve',
				moduleResolution: 'bundler',
				paths: {
					[GEN_CODE_ALIAS]: [path.join('..', ROUTER_PATH)],
				},
			},
			include: [
				'../src/**/*.js',
				'../src/**/*.ts',
				'../src/**/*.svelte',
				'../tests/**/*.js',
				'../tests/**/*.ts',
				'../tests/**/*.svelte',
				'./router.ts',
			],
		};
		writeFileIfDifferent(TSCONFIG_PATH, JSON.stringify(tsConfig, undefined, 2));

		console.log('✅️ Routes generated');
	} catch (error) {
		console.error('Error during routes generation:', error);
	}
}

function writeFileIfDifferent(filePath: string, content: string) {
	if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
		fs.writeFileSync(filePath, content);
	}
}
