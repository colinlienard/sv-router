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
	/**
	 * Regex expressions of files to ignore when generating routes.
	 *
	 * @default empty array
	 */
	ignore?: RegExp[];
};

export const router: (options?: RouterOptions) => Plugin;
