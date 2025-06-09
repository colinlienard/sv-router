# View Transitions

You can enable view transitions by passing the `viewTransition` option to the `navigate` function:

```ts
navigate('/about', { viewTransition: true });
```

Or by adding the `data-view-transition` attribute to an anchor tag:

```svelte
<a href={p('/about')} data-view-transition>About</a>
```

This will wrap the navigation in `document.startViewTransition()`. If not supported, it will fallback to a regular navigation.

Then, you can customize the animation effects with CSS (example from the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using)):

```css
@keyframes move-out {
	from {
		transform: translateY(0%);
	}

	to {
		transform: translateY(-100%);
	}
}

@keyframes move-in {
	from {
		transform: translateY(100%);
	}

	to {
		transform: translateY(0%);
	}
}

/* Apply the custom animation to the old and new page states */

::view-transition-old(root) {
	animation: 0.4s ease-in both move-out;
}

::view-transition-new(root) {
	animation: 0.4s ease-in both move-in;
}
```
