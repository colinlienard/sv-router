import { createRouter } from 'svelte-path';
import Layout from './Layout.svelte';
import About from './routes/About.svelte';
import DynamicPost from './routes/DynamicPost.svelte';
import Home from './routes/Home.svelte';
import NotFound from './routes/NotFound.svelte';
import Posts from './routes/Posts.svelte';
import StaticPost from './routes/StaticPost.svelte';

export const { typedPathFn: p, queryParams } = createRouter({
	'/': Home,
	'/about': About,
	'/posts': {
		'/': Posts,
		'/static': StaticPost,
		'/:id': DynamicPost,
		layout: Layout,
	},
	'*': NotFound,
});
