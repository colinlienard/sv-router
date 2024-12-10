/**
 * @type {{
 * 	routesPath: string;
 * 	readonly genCodeDirPath: string;
 * 	readonly routerPath: string;
 * 	readonly tsconfigPath: string;
 * 	readonly genCodeAlias: string;
 * }}
 */

export const genConfig = {
	routesPath: 'src/routes',
	genCodeDirPath: '.router',
	routerPath: '.router/router.ts',
	tsconfigPath: '.router/tsconfig.json',
	genCodeAlias: 'sv-router/generated',
};
