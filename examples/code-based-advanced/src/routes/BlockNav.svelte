<script lang="ts">
	import { blockNavigation } from 'sv-router';
	import { navigate } from '../router';

	let mode: 'none' | 'sync' | 'async' | 'beforeUnload' = $state('none');
	let asyncDelay = $state(1000);
	let blocked = $state(false);

	$effect(() => {
		if (mode === 'none') return;

		if (mode === 'sync') {
			return blockNavigation(() => {
				const allow = confirm('Allow navigation? (sync)');
				blocked = !allow;
				return allow;
			});
		}

		if (mode === 'async') {
			return blockNavigation(async () => {
				const allow = await new Promise<boolean>((resolve) => {
					blocked = true;
					setTimeout(() => {
						const result = confirm(`Allow navigation? (after ${asyncDelay}ms delay)`);
						blocked = !result;
						resolve(result);
					}, asyncDelay);
				});
				return allow;
			});
		}

		if (mode === 'beforeUnload') {
			return blockNavigation({
				beforeUnload() {
					return false;
				},
				async onNavigate() {
					const allow = confirm('Allow navigation? (with beforeUnload)');
					blocked = !allow;
					return allow;
				},
			});
		}
	});
</script>

<h1>Block Navigation</h1>

<fieldset>
	<legend>Blocker mode</legend>
	<label>
		<input type="radio" bind:group={mode} value="none" />
		None (navigation allowed)
	</label>
	<label>
		<input type="radio" bind:group={mode} value="sync" />
		Sync confirm
	</label>
	<label>
		<input type="radio" bind:group={mode} value="async" />
		Async confirm (with delay)
	</label>
	<label>
		<input type="radio" bind:group={mode} value="beforeUnload" />
		With beforeUnload (blocks tab close)
	</label>
</fieldset>

{#if mode === 'async'}
	<label>
		Delay (ms): <input type="number" bind:value={asyncDelay} min="0" step="500" />
	</label>
{/if}

<p>Status: {blocked ? 'Navigation was blocked' : 'Ready'}</p>
<p>
	Current mode: <strong>{mode}</strong>
</p>

<h2>Test navigation</h2>
<ul>
	<li><a href="/">Link to Home</a></li>
	<li><a href="/about">Link to About</a></li>
	<li><button onclick={() => navigate('/')}>Programmatic to Home</button></li>
	<li><button onclick={() => navigate(-1)}>Go back (history)</button></li>
</ul>

{#if mode === 'beforeUnload'}
	<p><em>Try closing or refreshing the tab — the browser should warn you.</em></p>
{/if}

<style>
	fieldset {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 12px;
	}
</style>
