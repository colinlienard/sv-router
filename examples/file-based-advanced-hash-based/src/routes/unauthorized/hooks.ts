import type { Hooks } from 'sv-router';
import { redirect } from 'sv-router/generated';

export default {
	async beforeLoad() {
		await new Promise((r) => setTimeout(r, 1000));
		throw redirect('/');
	},
} satisfies Hooks;
