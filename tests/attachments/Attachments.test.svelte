<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isActiveLink } from '../../src/attachments.svelte.js';
	import { constructPath } from '../../src/helpers/utils.js';

	type Props = {
		children: Snippet | string;
		href?: string;
		rawHref?: string;
		className?: string;
		startsWith?: boolean;
	};

	let { children, href = '/', rawHref, ...options }: Props = $props();
</script>

<!-- Like `p(href)` -->
<a href={rawHref ?? constructPath(href)} {@attach isActiveLink(options)}>{children}</a>
