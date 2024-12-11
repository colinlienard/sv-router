#!/usr/bin/env node

import { genConfig } from '../gen/config.js';
import { writeRouterCode } from '../gen/write-router-code.js';

const args = process.argv.slice(2).flatMap((arg) => arg.split('='));

const pathArgIndex = args.indexOf('--path');
if (pathArgIndex !== -1 && pathArgIndex + 1 < args.length) {
	genConfig.routesPath = args[pathArgIndex + 1];
}

writeRouterCode();
