import type { Plugin } from 'vite';

export type RouterOptions = {
	/**
	 * The path to the routes folder.
	 *
	 * @default 'src/routes'
	 */
	path?: string;
};

export const router: (options?: RouterOptions) => Plugin;
