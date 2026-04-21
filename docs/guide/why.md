---
title: Why sv-router?
description: 'Why choose sv-router: type-safe navigation, nested routes, hooks, preloading, and reactive search params, built for Svelte 5 SPAs.'
---

# Why sv-router?

sv-router is a type-safe router built specifically for Svelte 5 single-page apps. This page explains the gap in the ecosystem it was built to fill, and what it offers instead.

<div class="tip custom-block" style="padding-top: 8px">

Just want to try it out? [Get started](./getting-started).

</div>

## The gap

Routing in the Svelte ecosystem is largely shaped by SvelteKit, the official meta-framework. But SvelteKit is built around a full-stack model that many Svelte projects don't actually need:

- SSR adds complexity that single-page apps rarely benefit from.
- Server routes nudge you toward a specific backend shape. That doesn't fit teams who keep their backend separate, sometimes in another language entirely.
- The file conventions (`+page.svelte`, `+layout.svelte`) are opinionated, and many developers prefer to define routes in code.

The community has tried to fill that gap, but most Svelte SPA routers are no longer actively maintained, and the two most downloaded, `svelte-routing` and `svelte-navigator`, don't support Svelte 5.

## What sv-router offers

sv-router is the router I wished existed for Svelte SPAs, inspired by TanStack Router and adapted to Svelte 5's idioms.

- **Type-safe navigation:** Paths, params, and search are validated at compile time, so broken links are caught before you ship.
- **Code-based _or_ file-based routing:** Pick whichever fits your project. Code-based keeps everything explicit in one place; file-based gives you a meta-framework-style structure.
- **Batteries included:** Nested layouts, hooks for guards and data loading, preloading strategies, reactive search params, and hash-based routing for Electron/Tauri.
- **Lightweight:** Under 5 kB gzipped.
- **Svelte 5 native:** Built on runes from day one.

If you need SSR, form actions, or a full-stack framework, SvelteKit is still the right choice. sv-router is for everything else: dashboards, internal tools, desktop apps, and any SPA where you want a solid, typed router.

## Acknowledgements

sv-router draws inspiration from:

- [TanStack Router](https://tanstack.com/router/latest)
- [Vue Router](https://router.vuejs.org/)
- [Solid Router](https://docs.solidjs.com/solid-router)
