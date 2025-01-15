#!/usr/bin/env node

import { genConfig } from '../gen/config.js';
import { writeRouterCode } from '../gen/write-router-code.js';

const args = process.argv.slice(2).flatMap((arg) => arg.split('='));

/**
 * @param {keyof import('../vite-plugin/index.d.ts').RouterOptions} option
 * @returns
 */
function arg(option) {
	const pathArgIndex = args.indexOf('--' + option);
	if (pathArgIndex === -1) return;
	if (pathArgIndex + 1 < args.length) {
		return args[pathArgIndex + 1];
	}
	return args[pathArgIndex];
}

const pathArg = arg('path');
if (pathArg) genConfig.routesPath = pathArg;

const jsArg = arg('js');
if (jsArg) genConfig.routesInJs = true;

writeRouterCode();
