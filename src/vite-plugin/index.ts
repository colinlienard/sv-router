import fs from 'node:fs';
import type { Plugin } from 'vite';
import { generateRouterCode } from './generate-router-code.ts';

const ROUTES_PATH = 'src/routes/';
const ROUTER_DIR_PATH = '.sv-router/router.ts';
const ROUTER_PATH = ROUTER_DIR_PATH + '/router.ts';

export function router(): Plugin {
	return {
		name: 'sv-router',
		async buildStart() {
			writeRouterCode();
		},
		async watchChange(file) {
			if (file.includes(ROUTES_PATH)) {
				writeRouterCode();
			}
		},
	};
}

function writeRouterCode() {
	const routerCode = generateRouterCode(ROUTES_PATH);
	if (!fs.existsSync(ROUTER_DIR_PATH)) {
		fs.mkdirSync(ROUTER_DIR_PATH);
	}
	fs.writeFileSync(ROUTER_PATH + '/router.ts', routerCode);
}
