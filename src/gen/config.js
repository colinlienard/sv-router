/**
 * @type {{
 * 	allLazy: boolean;
 * 	base: string | undefined;
 * 	ignore: RegExp[];
 * 	readonly genCodeAlias: string;
 * 	readonly genCodeDirPath: string;
 * 	readonly routerPath: string;
 * 	readonly tsconfigPath: string;
 * 	routesInJs: boolean;
 * 	routesPath: string;
 * }}
 */
export const genConfig = {
	allLazy: false,
	base: undefined,
	genCodeAlias: 'sv-router/generated',
	genCodeDirPath: '.router',
	ignore: [],
	get routerPath() {
		return '.router/router.' + (this.routesInJs ? 'js' : 'ts');
	},
	routesInJs: false,
	routesPath: 'src/routes',
	tsconfigPath: '.router/tsconfig.json',
};

/** @param {import('../vite-plugin/index.d.ts').RouterOptions | undefined} options */
export function setGenConfig(options) {
	genConfig.allLazy = options?.allLazy || false;
	genConfig.base = options?.base;
	genConfig.ignore = options?.ignore || [];
	genConfig.routesInJs = options?.js || false;
	genConfig.routesPath = options?.path || 'src/routes';
}
