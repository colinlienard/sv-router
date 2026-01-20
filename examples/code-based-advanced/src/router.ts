import { createRouter } from 'sv-router';
import Layout from './Layout.svelte';
import About from './routes/About.svelte';
import AMoreNestedRoute from './routes/AMoreNestedRoute.svelte';
import Home from './routes/Home.svelte';
import StaticPost from './routes/StaticPost.svelte';

export const { p, navigate, redirect, isActive, preload, route } = createRouter({
	'/': Home,
	'/about': About,
	'/a/more/nested/route': AMoreNestedRoute,
	'/posts': {
		'/': () => import('./routes/Posts.svelte'),
		'/static': StaticPost,
		'/:slug': {
			'/': () => import('./routes/DynamicPost.svelte'),
			meta: {
				section: 'Comments',
			},
		},
		'/comments': {
			'/(:commentId)': () => import('./routes/Comment.svelte'),
			hooks: {
				afterLoad() {
					// eslint-disable-next-line no-console
					console.log('Loaded comment');
				},
				onPreload() {
					// eslint-disable-next-line no-console
					console.log('Comments route preloaded');
				},
			},
		},
		layout: Layout,
		meta: {
			public: true,
			section: 'Posts',
		},
	},
	'/unauthorized': {
		'/': () => import('./routes/Unauthorized.svelte'),
		hooks: {
			async beforeLoad() {
				await new Promise((r) => setTimeout(r, 1000));
				throw redirect('/');
			},
		},
	},
	'*notfound': () => import('./routes/NotFound.svelte'),
});
