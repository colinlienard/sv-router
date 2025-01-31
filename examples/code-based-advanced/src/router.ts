import { createRouter } from 'sv-router';
import Home from './routes/Home.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': () => import('./routes/About.svelte'),
	'/a/more/nested/route': () => import('./routes/AMoreNestedRoute.svelte'),
	'/posts': {
		'/': () => import('./routes/Posts.svelte'),
		'/static': () => import('./routes/StaticPost.svelte'),
		'/:slug': () => import('./routes/DynamicPost.svelte'),
		'/comments': {
			'/:commentId': () => import('./routes/Comment.svelte'),
			hooks: {
				afterLoad() {
					console.log('Loaded comment');
				},
			},
		},
		layout: () => import('./Layout.svelte'),
	},
	'/unauthorized': {
		'/': () => import('./routes/Unauthorized.svelte'),
		hooks: {
			async beforeLoad() {
				await new Promise((r) => setTimeout(r, 1000));
				throw navigate('/');
			},
		},
	},
	'*notfound': () => import('./routes/NotFound.svelte'),
});
