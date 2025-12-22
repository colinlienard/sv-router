#!/usr/bin/env node
/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { genConfig } from '../gen/config.js';
import { writeRouterCode } from '../gen/write-router-code.js';

const args = process.argv.slice(2).flatMap((arg) => arg.split('='));

if (args.length > 0) {
	parseArgs();
} else {
	parseViteConfig();
}

writeRouterCode();

function parseViteConfig() {
	const viteConfig = readViteConfig('ts') || readViteConfig('js');
	if (!viteConfig) return;
	const routerConfig = extractRouterConfig(viteConfig);
	if (!routerConfig) return;
	console.log('ℹ️ Using router plugin options from Vite config');
	if (routerConfig.allLazy) genConfig.allLazy = routerConfig.allLazy;
	if (routerConfig.routesInJs) genConfig.routesInJs = routerConfig.routesInJs;
	if (routerConfig.routesPath) genConfig.routesPath = routerConfig.routesPath;
	if (routerConfig.ignore) genConfig.ignore = routerConfig.ignore;
}

/**
 * @param {'js' | 'ts'} extention
 * @returns {string | undefined}
 */
function readViteConfig(extention) {
	const vitePath = path.join(process.cwd(), 'vite.config.' + extention);
	if (existsSync(vitePath)) {
		return readFileSync(vitePath, 'utf8');
	}
}

/**
 * @param {string} viteConfig
 * @returns {Record<string, any> | undefined}
 */
function extractRouterConfig(viteConfig) {
	const regex = /router\(\s*(\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})\s*\)/;
	const match = viteConfig.match(regex);
	if (!match) return;
	try {
		return new Function(`return ${match[1]}`)();
	} catch (error) {
		console.error('⚠️ Error parsing router config:', error);
	}
}

function parseArgs() {
	const allLazyArg = arg('allLazy');
	if (allLazyArg) genConfig.allLazy = true;

	const jsArg = arg('js');
	if (jsArg) genConfig.routesInJs = true;

	const pathArg = arg('path');
	if (pathArg) genConfig.routesPath = pathArg;

	const ignoreArg = arg('ignore');
	if (ignoreArg) genConfig.ignore = ignoreArg.split(',').map((ignore) => new RegExp(ignore, 'gu'));
}

/**
 * @param {keyof import('../vite-plugin/index.d.ts').RouterOptions} option
 * @returns {string | undefined}
 */
function arg(option) {
	const pathArgIndex = args.indexOf('--' + option);
	if (pathArgIndex === -1) return;
	if (pathArgIndex + 1 < args.length) {
		return args[pathArgIndex + 1];
	}
	return args[pathArgIndex];
}
