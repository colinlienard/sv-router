import { defineConfig } from 'vitepress';

export default defineConfig({
	title: 'sv-router | Modern Svelte routing',
	description: 'A feature-rich yet intuitive routing library for Svelte single-page apps.',
	head: [['link', { rel: 'icon', href: '/logo.svg' }]],
	cleanUrls: true,
	themeConfig: {
		logo: '/logo.svg',
		siteTitle: 'sv-router',
		nav: [
			{ text: 'Guide', link: '/guide/why', activeMatch: '/guide/' },
			{ text: 'Reference', link: '/reference/foo', activeMatch: '/reference/' },
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
					items: [
						{ text: 'Why sv-router?', link: '/guide/why' },
						{ text: 'Getting Started', link: '/guide/getting-started' },
					],
				},
			],
			'/reference': [
				{
					text: 'Reference',
					items: [
						{ text: 'foo', link: '/reference/foo' },
						{ text: 'bar', link: '/reference/bar' },
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
});
