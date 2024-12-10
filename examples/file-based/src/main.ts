import { mount } from 'svelte';
import App from './App.svelte';
import 'sv-router/generated';

mount(App, { target: document.querySelector('#app')! });
