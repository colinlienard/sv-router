/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { genConfig } from './gen-config.js';
import { generateRouterCode } from './generate-router-code.js';

export function writeRouterCode() {
	try {
		if (!fs.existsSync(genConfig.genCodeDirPath)) {
			fs.mkdirSync(genConfig.genCodeDirPath);
		}

		// Write `.router/router.ts` file
		const routerCode = generateRouterCode(genConfig.routesPath);
		writeFileIfDifferent(genConfig.routerPath, routerCode);

		// Write `.router/tsconfig.json` file
		const tsConfig = {
			compilerOptions: {
				module: 'preserve',
				moduleResolution: 'bundler',
				paths: {
					[genConfig.genCodeAlias]: [path.join('..', genConfig.routerPath)],
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
		writeFileIfDifferent(genConfig.tsconfigPath, JSON.stringify(tsConfig, undefined, 2));

		console.log('✅️ Routes generated');
	} catch (error) {
		console.error('Error during routes generation:', error);
	}
}

/**
 * @param {string} filePath
 * @param {string} content
 */
function writeFileIfDifferent(filePath, content) {
	if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
		fs.writeFileSync(filePath, content);
	}
}
