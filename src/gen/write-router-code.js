/* eslint-disable no-console */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { genConfig } from './config.js';
import { generateRouterCode } from './generate-router-code.js';

export function writeRouterCode() {
	try {
		if (!fs.existsSync(genConfig.genCodeDirPath)) {
			fs.mkdirSync(genConfig.genCodeDirPath);
		}

		// Write `.router/tsconfig.json` file
		const tsMajor = getTypeScriptMajorVersion();
		const useBaseUrl = tsMajor === undefined || tsMajor < 6;
		let alias = genConfig.routerPath;
		if (!useBaseUrl) {
			alias = alias.replace(genConfig.genCodeDirPath, '.');
		}
		const tsConfig = {
			compilerOptions: {
				module: 'preserve',
				moduleResolution: 'bundler',
				...(useBaseUrl ? { baseUrl: '..' } : {}),
				paths: { [genConfig.genCodeAlias]: [alias] },
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
		const routerCode = generateRouterCode(genConfig.routesPath, {
			allLazy: genConfig.allLazy,
			js: genConfig.routesInJs,
			ignore: genConfig.ignore,
		});
		const written = writeFileIfDifferent(genConfig.routerPath, routerCode);

		if (written) {
			console.log('❇️ Routes generated');
		} else {
			console.log('✅️ Routes already up to date');
		}
	} catch (error) {
		console.error(
			'⚠️ Error during routes generation:',
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

function getTypeScriptMajorVersion() {
	try {
		const require = createRequire(process.cwd() + '/package.json');
		const tsPackagePath = require.resolve('typescript/package.json');
		const tsPackage = JSON.parse(fs.readFileSync(tsPackagePath, 'utf8'));
		return Number(tsPackage.version.split('.')[0]);
	} catch {
		return;
	}
}
