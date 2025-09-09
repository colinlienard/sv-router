<script lang="ts">
	import type { Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();
</script>

<main>
    route group can have its own layout
    <br />
    {@render children()}
</main>