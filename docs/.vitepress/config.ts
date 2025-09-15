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
			{
				text: 'Guide',
				activeMatch: '/guide',
				items: [
					{
						text: 'Code-based routing',
						link: '/guide/code-based/route-definition',
						activeMatch: '/guide/code-based',
					},
					{
						text: 'File-based routing',
						link: '/guide/file-based/route-definition',
						activeMatch: '/guide/file-based',
					},
				],
			},
			{
				text: 'Reference',
				link: '/reference/',
				activeMatch: '/reference/',
			},
			{
				text: 'Examples',
				link: 'https://github.com/colinlienard/sv-router/tree/main/examples',
			},
			{
				text: 'Changelog',
				link: 'https://github.com/colinlienard/sv-router/blob/main/CHANGELOG.md',
			},
		],
		sidebar: {
			'/guide': [
				...getSidebarIntro(),
				{
					text: 'Approaches',
					items: [
						{
							text: 'Code-based',
							link: '/guide/code-based/route-definition',
						},
						{
							text: 'File-based',
							link: '/guide/file-based/route-definition',
						},
					],
				},
				...getSidebarOutro(),
			],
			'/guide/code-based': [
				...getSidebarIntro(),
				...getSidebarGuide('code-based'),
				...getSidebarOutro(),
			],
			'/guide/file-based': [
				...getSidebarIntro(),
				...getSidebarGuide('file-based'),
				...getSidebarOutro(),
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
	sitemap: {
		hostname: 'https://sv-router.vercel.app',
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
		plugins: [groupIconVitePlugin()],
	},
});

function getSidebarIntro() {
	return [
		{
			text: 'Introduction',
			items: [
				{ text: 'Why sv-router?', link: '/guide/why' },
				{ text: 'Getting Started', link: '/guide/getting-started' },
			],
		},
	];
}

function getSidebarOutro() {
	return [
		{
			text: 'Tips',
			link: '/guide/tips',
		},
		{
			text: 'API reference',
			link: '/reference',
		},
	];
}

function getSidebarGuide(mode: 'code-based' | 'file-based') {
	const base = '/guide/' + mode;
	return [
		{
			text: 'Setup',
			base,
			items: [
				{
					text: 'Manual Setup',
					link: '/manual-setup',
				},
				...(mode === 'file-based'
					? [
							{
								text: 'Configuration',
								link: '/configuration',
							},
						]
					: []),
			],
		},
		{
			text: 'Essentials',
			base,
			items: [
				{ text: 'Route Definition', link: '/route-definition' },
				{ text: 'Dynamic Routes', link: '/dynamic-routes' },
				{ text: 'Catch-All Routes', link: '/catch-all-routes' },
				{ text: 'Layouts', link: '/layouts' },
				{ text: 'Navigation', link: '/navigation' },
				{ text: 'Search Params', link: '/search-params' },
				{ text: 'Active Route', link: '/active-route' },
			],
		},
		{
			text: 'Advanced',
			base,
			items: [
				{ text: 'Hooks', link: '/hooks' },
				{ text: 'Basename', link: '/basename' },
				{ text: 'Code Splitting', link: '/code-splitting' },
				{ text: 'Preloading', link: '/preloading' },
				{ text: 'Route Metadata', link: '/route-metadata' },
				{ text: 'Route Groups', link: '/route-groups' },
				{ text: 'Scroll Behavior', link: '/scroll-behavior' },
				{ text: 'View Transitions', link: '/view-transitions' },
			],
		},
	];
}
