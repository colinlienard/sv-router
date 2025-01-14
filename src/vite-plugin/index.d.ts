import type { Plugin } from 'vite';

export type RouterOptions = {
	/**
	 * The path to the routes folder.
	 *
	 * @default 'src/routes'
	 */
	path?: string;
	/**
	 * If true, generates the routes in a .js file instead of a .ts file.
	 *
	 * @default false
	 */
	routesInJs?: boolean;
};

export const router: (options?: RouterOptions) => Plugin;
