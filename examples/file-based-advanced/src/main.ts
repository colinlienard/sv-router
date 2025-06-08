import 'sv-router/generated';
import { mount } from 'svelte';
import App from './App.svelte';

declare module 'sv-router' {
	interface RouteMeta {
		title: string;
		description: string;
		foo?: string;
	}
}

mount(App, { target: document.querySelector('#app')! });
