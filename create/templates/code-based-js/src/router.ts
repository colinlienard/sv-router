import { createRouter } from 'sv-router';
import About from './routes/About.svelte';
import Home from './routes/Home.svelte';

export const { p, navigate, isActive, route } = createRouter({
	'/': Home,
	'/about': About,
});
