import { createRouter } from 'sv-router';
import Layout from './Layout.svelte';
import About from './routes/About.svelte';
import DynamicPost from './routes/DynamicPost.svelte';
import Home from './routes/Home.svelte';
import NotFound from './routes/NotFound.svelte';
import Posts from './routes/Posts.svelte';
import StaticPost from './routes/StaticPost.svelte';

export const { p, navigate, isActive, preload, route } = createRouter({
	'/': Home,
	'/about': About,
	'/posts': {
		'/': Posts,
		'/static': StaticPost,
		'/:slug': DynamicPost,
		layout: Layout,
	},
	'*notfound': NotFound,
});
