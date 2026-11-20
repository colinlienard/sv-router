<script>
	import { untrack } from 'svelte';
	import RecursiveComponentTree from './RecursiveComponentTree.svelte';

	/** @type {{ tree: import('svelte').Component[]; route: import('./index.d.ts').RouteSnapshot }} */
	let props = $props();

	const Component = untrack(() => props.tree[0]);

	// A component that is leaving, e.g. while its out transition plays, keeps the tree and the
	// route it was rendered for instead of receiving the ones of the next route.
	let rendered = untrack(() => ({ tree: props.tree, route: props.route }));
	const current = $derived.by(() => {
		if (props.tree[0] === Component) {
			rendered = { tree: props.tree, route: props.route };
		}
		return rendered;
	});
	const restTree = $derived(current.tree.slice(1));
</script>

{#if Component}
	<Component route={current.route}>
		{#key restTree[0]}
			<RecursiveComponentTree tree={restTree} route={current.route}></RecursiveComponentTree>
		{/key}
	</Component>
{/if}
