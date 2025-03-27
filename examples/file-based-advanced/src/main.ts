import 'sv-router/generated';
import { setBasename } from 'sv-router';
import { mount } from 'svelte';
import App from './App.svelte';

setBasename('/fr');

setTimeout(() => {
	setBasename('/en');
}, 2000);

mount(App, { target: document.querySelector('#app')! });
