import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte(), svelteTesting()],
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: ['./tests/vitest-setup.js'],
		coverage: {
			provider: 'v8',
			include: ['src/**'],
			exclude: ['src/cli/**', 'src/vite-plugin/**', 'src/*.d.ts'],
			reporter: ['text', 'json'],
		},
	},
});
