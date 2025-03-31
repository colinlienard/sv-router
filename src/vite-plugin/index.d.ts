import type { Plugin } from 'vite';

export type RouterOptions = {
	/**
	 * If true, all routes will be lazy loaded by default.
	 *
	 * @default false
	 */
	allLazy?: boolean;
	/**
	 * If true, generates the routes in a .js file instead of a .ts file.
	 *
	 * @default false
	 */
	js?: boolean;
	/**
	 * The path to the routes folder.
	 *
	 * @default 'src/routes'
	 */
	path?: string;
};

export const router: (options?: RouterOptions) => Plugin;
