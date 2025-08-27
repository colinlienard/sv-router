export class Navigation extends Error {
	constructor(
		/** @type {string} target */
		target,
	) {
		super(`Navigating to: ${target}`);
		this.name = 'Redirect';
	}
}
