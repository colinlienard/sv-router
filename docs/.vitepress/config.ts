import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

export default defineConfig({
	title: 'sv-router | Modern Svelte Routing',
	description: 'A feature-rich yet intuitive routing library for Svelte single-page apps.',
	head: [['link', { rel: 'icon', href: '/logo.svg' }]],
	cleanUrls: true,
	themeConfig: {
		logo: '/logo.svg',
		siteTitle: 'sv-router',
		nav: [
			{ text: 'Guide', link: '/guide/why', activeMatch: '/guide/' },
			{ text: 'Reference', link: '/reference/', activeMatch: '/reference/' },
			{ text: 'Examples', link: 'https://github.com/colinlienard/sv-router/tree/main/examples' },
			{
				text: 'Changelog',
				link: 'https://github.com/colinlienard/sv-router/blob/main/CHANGELOG.md',
			},
		],
		sidebar: {
			'/guide': [
				{
					text: 'Introduction',
					collapsed: false,
					items: [
						{ text: 'Why sv-router?', link: '/guide/why' },
						{ text: 'Getting Started', link: '/guide/getting-started' },
					],
				},
				{
					text: 'Code-based Routing',
					collapsed: false,
					items: [
						{ text: 'Manual Setup', link: '/guide/code-based/manual-setup' },
						{ text: 'Routing Concepts', link: '/guide/code-based/routing-concepts' },
						{ text: 'Hooks', link: '/guide/code-based/hooks' },
						{ text: 'Code Splitting', link: '/guide/code-based/code-splitting' },
					],
				},
				{
					text: 'File-based Routing',
					collapsed: false,
					items: [
						{ text: 'Manual Setup', link: '/guide/file-based/manual-setup' },
						{ text: 'Routing Concepts', link: '/guide/file-based/routing-concepts' },
						{ text: 'Hooks', link: '/guide/file-based/hooks' },
						{ text: 'Code Splitting', link: '/guide/file-based/code-splitting' },
						{ text: 'Configuration', link: '/guide/file-based/configuration' },
					],
				},
				{
					text: 'Common',
					collapsed: false,
					items: [
						{ text: 'Navigation', link: '/guide/common/navigation' },
						{ text: 'Search Params', link: '/guide/common/search-params' },
						{ text: 'Active Route', link: '/guide/common/active-route' },
						{ text: 'Preloading', link: '/guide/common/preloading' },
						{ text: 'Basename', link: '/guide/common/basename' },
						{ text: 'Scroll Behavior', link: '/guide/common/scroll-behavior' },
						{ text: 'View Transitions', link: '/guide/common/view-transitions' },
					],
				},
				{
					text: 'Tips',
					link: '/guide/tips',
				},
				{
					text: 'API reference',
					link: '/reference/',
				},
			],
			'/reference': [
				{
					text: 'Reference',
					items: [
						{ text: 'sv-router', link: '/reference/' },
						{ text: 'sv-router/vite-plugin', link: '/reference/vite-plugin' },
					],
				},
			],
		},
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/colinlienard/sv-router' },
			{ icon: 'x', link: 'https://x.com/colinlienard' },
		],
		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2025 Colin Lienard',
		},
		search: {
			provider: 'local',
		},
	},
	markdown: {
		config(md) {
			md.use(groupIconMdPlugin);
			md.use(() => {
				const fenceRule = md.renderer.rules.fence;
				if (fenceRule) {
					md.renderer.rules.fence = (...args) => {
						return fenceRule(...args)
							.replaceAll('(|', '[')
							.replaceAll('|)', ']');
					};
				}
			});
		},
	},
	vite: {
		// @ts-expect-error Types not up-to-date
		plugins: [groupIconVitePlugin()],
	},
});
