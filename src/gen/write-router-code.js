/* eslint-disable no-console */
import fs from 'node:fs';
import { genConfig } from './config.js';
import { generateRouterCode } from './generate-router-code.js';

export function writeRouterCode() {
	try {
		if (!fs.existsSync(genConfig.genCodeDirPath)) {
			fs.mkdirSync(genConfig.genCodeDirPath);
		}

		// Write `.router/tsconfig.json` file
		const tsConfig = {
			compilerOptions: {
				module: 'preserve',
				moduleResolution: 'bundler',
				baseUrl: '..',
				paths: {
					[genConfig.genCodeAlias]: [genConfig.routerPath],
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

		// Write `.router/router.ts` file
		const routerCode = generateRouterCode(genConfig.routesPath);
		const written = writeFileIfDifferent(genConfig.routerPath, routerCode);

		if (written) {
			console.log('✅️ Routes generated');
		} else {
			console.log('✅️ Routes already up to date');
		}
	} catch (error) {
		console.error(
			'Error during routes generation:',
			error instanceof Error ? error.message : String(error),
		);
	}
}

/**
 * @param {string} filePath
 * @param {string} content
 */
function writeFileIfDifferent(filePath, content) {
	if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8') !== content) {
		fs.writeFileSync(filePath, content);
		return true;
	}
}
