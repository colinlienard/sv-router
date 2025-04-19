#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { execa } from 'execa';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

function checkCancel(value) {
	if (p.isCancel(value)) {
		p.cancel('Operation cancelled.');
		process.exit(0);
	}
}

p.intro(`create-sv-router`);

const locationPlaceholder = 'Leave blank to use `./`';
let location = await p.text({
	message: 'Where do you want to create your project?',
	placeholder: locationPlaceholder,
});
checkCancel(location);
if (location === locationPlaceholder) location = '';

const template = await p.select({
	message: 'Choose your template.',
	options: [
		{ value: 'file-based', label: 'File-based routing' },
		{ value: 'code-based', label: 'Code-based routing' },
	],
});
checkCancel(template);

const target = path.join(process.cwd(), location);
if (location) {
	fs.mkdirSync(target, { recursive: true });
}
fs.cpSync(path.join(dirname, '../templates', template), target, { recursive: true });

const pkgManager = await p.select({
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

if (pkgManager) {
	const s = p.spinner();
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

const initGit = await p.confirm({
	message: 'Initialize a git repository?',
});
checkCancel(initGit);
if (initGit) {
	try {
		await execa('git', ['init'], { cwd: target });
		p.log.step('Git repository initialized');
	} catch (error) {
		p.log.error('Failed to initialize git repository');
		console.error(error);
		process.exit(1);
	}
}

p.outro("You're all set! You can now run:");
const commands = [
	...(location ? [`cd ${location}`] : []),
	...(pkgManager ? [] : ['npm install']),
	(pkgManager || 'npm') + ' run dev',
].map((command, index) => {
	const stepNumber = `\u001B[94m${index + 1}.\u001B[0m`;
	const commandText = `\u001B[37m${command}\u001B[0m`;
	return `${stepNumber} ${commandText}`;
});
console.log([...commands, ''].join('\n'));
