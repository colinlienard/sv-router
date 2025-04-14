#!/usr/bin/env node

import { cancel, intro, isCancel, outro, select, spinner, text } from '@clack/prompts';

function checkCancel(value) {
	if (isCancel(value)) {
		cancel('Operation cancelled.');
		process.exit(0);
	}
}

intro(`create-sv-router`);

const location = await text({
	message: 'Where do you want to create your project?',
	placeholder: 'Leave blank to use `./`',
});
checkCancel(location);

const type = await select({
	message: 'Pick a type.',
	options: [
		{ value: 'file', label: 'File-based routing' },
		{ value: 'code', label: 'Code-based routing' },
	],
});
checkCancel(type);

const installDeps = await select({
	message: 'Which package manager do you want to install dependencies with?',
	options: [
		{ value: 'none', label: 'None' },
		{ value: 'npm', label: 'npm' },
		{ value: 'yarn', label: 'yarn' },
		{ value: 'pnpm', label: 'pnpm' },
		{ value: 'bun', label: 'bun' },
		{ value: 'deno', label: 'deno' },
	],
});
checkCancel(installDeps);

if (installDeps !== 'none') {
	const s = spinner();
	s.start('Installing via npm');
	await new Promise((resolve) => setTimeout(resolve, 1000));
	s.stop('Installed via npm');
}

outro("You're all set!");
