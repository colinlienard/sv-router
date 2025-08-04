import type { Hooks } from 'sv-router';
import { navigate } from 'sv-router/generated';

export default {
	async beforeLoad() {
		await new Promise((r) => setTimeout(r, 1000));
		throw navigate('/');
	},
} satisfies Hooks;
