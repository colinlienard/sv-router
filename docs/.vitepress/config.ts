import { defineConfig } from 'vitepress';
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons';

export default defineConfig({
	title: 'sv-router | Type-safe routing for Svelte SPAs',
	description: 'Flexible, ergonomic, and complete Svelte 5 router',
	head: [
		['link', { rel: 'icon', href: '/logo.svg' }],
		['meta', { name: 'twitter:site', content: '@colinlienard' }],
		['meta', { name: 'twitter:card', content: 'summary_large_image' }],
		['meta', { name: 'twitter:image', content: 'https://sv-router.vercel.app/og-image.png' }],
		['meta', { property: 'og:image', content: 'https://sv-router.vercel.app/og-image.png' }],
		['meta', { property: 'og:image:width', content: '1200' }],
		['meta', { property: 'og:image:height', content: '630' }],
		['meta', { property: 'og:image:type', content: 'image/png' }],
		['meta', { property: 'og:site_name', content: 'sv-router' }],
		['meta', { property: 'og:type', content: 'website' }],
	],
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
		editLink: {
			pattern: 'https://github.com/colinlienard/sv-router/edit/main/docs/:path',
			text: 'Edit this page on GitHub',
		},
		lastUpdated: {},
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
	transformPageData(pageData) {
		const slug = pageData.relativePath.replace(/(index)?\.md$/, '').replace(/\/$/, '');
		const canonicalUrl = `https://sv-router.vercel.app/${slug}`;
		pageData.frontmatter.head ??= [];
		pageData.frontmatter.head.push(
			['link', { rel: 'canonical', href: canonicalUrl }],
			['meta', { property: 'og:url', content: canonicalUrl }],
			['meta', { property: 'og:title', content: pageData.title }],
			['meta', { property: 'og:description', content: pageData.description }],
			['meta', { name: 'twitter:title', content: pageData.title }],
			['meta', { name: 'twitter:description', content: pageData.description }],
		);
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
				...(mode === 'file-based' ? [{ text: 'Route Groups', link: '/route-groups' }] : []),
				{ text: 'Scroll Behavior', link: '/scroll-behavior' },
				{ text: 'View Transitions', link: '/view-transitions' },
			],
		},
	];
}
