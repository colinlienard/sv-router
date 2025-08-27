import { mount } from 'svelte';
import App from './App.svelte';

mount(App, {
	target: /** @type {HTMLElement} */ (document.querySelector('#app')),
});
