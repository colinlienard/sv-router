#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cancel, intro, isCancel, outro, select, spinner, text } from '@clack/prompts';
import { execa } from 'execa';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function checkCancel(value) {
	if (isCancel(value)) {
		cancel('Operation cancelled.');
		process.exit(0);
	}
}

intro(`create-sv-router`);

const locationPlaceholder = 'Leave blank to use `./`';
let location = await text({
	message: 'Where do you want to create your project?',
	placeholder: locationPlaceholder,
});
checkCancel(location);
if (location === locationPlaceholder) location = '';

const template = await select({
	message: 'Choose your template.',
	options: [
		{ value: 'file-based', label: 'File-based routing' },
		{ value: 'code-based', label: 'Code-based routing' },
	],
});
checkCancel(template);

const pkgManager = await select({
	message: 'Which package manager do you want to install dependencies with?',
	options: [
		{ value: '', label: 'None' },
		{ value: 'npm', label: 'npm' },
		{ value: 'yarn', label: 'yarn' },
		{ value: 'pnpm', label: 'pnpm' },
		{ value: 'bun', label: 'bun' },
		{ value: 'deno', label: 'deno' },
	],
});
checkCancel(pkgManager);

const target = path.join(process.cwd(), location);
if (location) {
	fs.mkdirSync(target);
}
fs.cpSync(path.join(dirname, '../templates', template), target, { recursive: true });
if (pkgManager) {
	const s = spinner();
	s.start('Installing dependencies with ' + pkgManager);
	try {
		await execa(pkgManager, ['install'], { cwd: target });
		s.stop('Dependencies installed with ' + pkgManager);
	} catch (error) {
		s.stop('Failed to install dependencies with ' + pkgManager);
		console.error(error);
		process.exit(1);
	}
}

outro("You're all set! You can now run:");
console.log(
	[
		...(location ? [`cd ${location}`] : []),
		...(pkgManager ? [] : ['npm install']),
		(pkgManager || 'npm') + ' run dev',
	].join('\n'),
);
