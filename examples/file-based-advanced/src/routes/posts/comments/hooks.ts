import type { Hooks } from 'sv-router';

export default {
	afterLoad() {
		console.log('Loaded comments');
	},
} satisfies Hooks;
