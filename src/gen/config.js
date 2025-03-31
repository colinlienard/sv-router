/**
 * @type {{
 * 	allLazy: boolean;
 * 	routesInJs: boolean;
 * 	routesPath: string;
 * 	readonly genCodeDirPath: string;
 * 	readonly routerPath: string;
 * 	readonly tsconfigPath: string;
 * 	readonly genCodeAlias: string;
 * }}
 */
export const genConfig = {
	routesPath: 'src/routes',
	routesInJs: false,
	allLazy: false,
	genCodeDirPath: '.router',
	get routerPath() {
		return '.router/router.' + (this.routesInJs ? 'js' : 'ts');
	},
	tsconfigPath: '.router/tsconfig.json',
	genCodeAlias: 'sv-router/generated',
};
