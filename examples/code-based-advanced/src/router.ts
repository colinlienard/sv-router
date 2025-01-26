import { createRouter } from 'sv-router';

export const { p, navigate, isActive, route } = createRouter({
	'/': () => import('./routes/Home.svelte'),
	'/about': () => import('./routes/About.svelte'),
	'/a/more/nested/route': () => import('./routes/AMoreNestedRoute.svelte'),
	'/posts': {
		'/': () => import('./routes/Posts.svelte'),
		'/static': () => import('./routes/StaticPost.svelte'),
		'/:slug': () => import('./routes/DynamicPost.svelte'),
		'/comments': {
			'/:commentId': () => import('./routes/Comment.svelte'),
		},
		layout: () => import('./Layout.svelte'),
	},
	'/unauthorized': {
		'/': () => import('./routes/Unauthorized.svelte'),
		hooks: {
			beforeLoad() {},
		},
	},
	'*notfound': () => import('./routes/NotFound.svelte'),
});
