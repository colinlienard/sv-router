export class Redirect extends Error {
	constructor(
		/** @type {string} target */
		target,
		/**
		 * @type {import('./index.d.ts').NavigateOptions & {
		 * 	params?: Record<string, string>;
		 * 	search?: import('./index.d.ts').Search;
		 * }}
		 */
		options,
	) {
		super(`Redirecting to: ${target}`);
		this.name = 'Redirect';
		this.target = target;
		this.options = options;
	}
}
