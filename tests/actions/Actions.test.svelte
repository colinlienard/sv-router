<script lang="ts">
	import type { Snippet } from 'svelte';
	import { isActiveLink } from '../../src/actions.svelte.js';

	type Props = {
		children: Snippet | string;
		href: string;
		className?: string;
		startsWith?: boolean;
	};

	let { children, href, ...options }: Props = $props();
</script>

<a {href} use:isActiveLink={options}>{children}</a>
