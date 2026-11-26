#!/usr/bin/env node
/* eslint-disable no-console */

import { genConfig, setGenConfig } from '../gen/config.js';
import { writeRouterCode } from '../gen/write-router-code.js';

const args = process.argv.slice(2).flatMap((arg) => arg.split('='));

if (args.length > 0) {
	parseArgs();
} else {
	await parseViteConfig();
}

writeRouterCode();

async function parseViteConfig() {
	/** @type {typeof import('vite').loadConfigFromFile} */
	let loadConfigFromFile;
	try {
		({ loadConfigFromFile } = await import('vite'));
	} catch {
		return;
	}
	try {
		const config = await loadConfigFromFile(
			{ command: 'serve', mode: 'development' },
			undefined,
			process.cwd(),
			'silent',
		);
		if (!config) return;
		const plugin = await findRouterPlugin(config.config.plugins);
		if (!plugin) return;
		console.log('ℹ️ Using router plugin options from Vite config');
		setGenConfig(plugin.api.options);
	} catch (error) {
		console.warn('⚠️ Error reading Vite config:', error);
	}
}

/**
 * @param {import('vite').PluginOption} option
 * @returns {Promise<import('vite').Plugin | undefined>}
 */
async function findRouterPlugin(option) {
	const resolved = await option;
	if (!resolved) return;
	if (Array.isArray(resolved)) {
		for (const item of resolved) {
			const plugin = await findRouterPlugin(item);
			if (plugin) return plugin;
		}
		return;
	}
	if (resolved.name === 'sv-router') {
		return resolved;
	}
}

function parseArgs() {
	const allLazyArg = arg('allLazy');
	if (allLazyArg) genConfig.allLazy = true;

	const baseArg = arg('base');
	if (baseArg) genConfig.base = baseArg;

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
