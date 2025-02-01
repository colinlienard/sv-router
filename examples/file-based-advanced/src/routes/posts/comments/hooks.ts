import type { Hooks } from 'sv-router';

export default {
	afterLoad() {
		// eslint-disable-next-line no-console
		console.log('Loaded comments');
	},
} satisfies Hooks;
