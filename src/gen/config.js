/**
 * @type {{
 * 	allLazy: boolean;
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
