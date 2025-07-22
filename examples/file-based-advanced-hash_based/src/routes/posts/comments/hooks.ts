import type { Hooks } from 'sv-router';

export default {
	afterLoad() {
		// eslint-disable-next-line no-console
		console.log('Loaded comments');
	},
	onPreload() {
		// eslint-disable-next-line no-console
		console.log('Comments route preloaded');
	},
} satisfies Hooks;
