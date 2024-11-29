import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export function router(): Plugin {
	return {
		name: 'sv-router',
		async buildStart() {
			const routesPath = path.resolve(process.cwd(), 'src/routes');
			const entries = fs.readdirSync(routesPath);
			for (const entry of entries) {
				const stat = fs.lstatSync(path.join(routesPath, entry));
				console.log(entry, stat.isDirectory());
			}
		},
	};
}
