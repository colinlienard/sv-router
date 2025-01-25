import { createRouter } from 'sv-router';
import DynamicPost from './routes/DynamicPost.svelte';
import Home from './routes/Home.svelte';
import NotFound from './routes/NotFound.svelte';
import Posts from './routes/Posts.svelte';
import StaticPost from './routes/StaticPost.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': () => import('./routes/About.svelte'),
	'/posts': {
		'/': Posts,
		'/static': StaticPost,
		'/:slug': DynamicPost,
		layout: () => import('./Layout.svelte'),
	},
	'*notfound': NotFound,
});
