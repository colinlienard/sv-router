---
'sv-router': minor
---

Move from actions to attachments

**Breaking**: If you were using the `isActiveLink` action, it is now an attachment and you should use it like this:

```svelte
<!-- Before -->
<a href={p('/about')} use:isActiveLink>About</a>

<!-- Attachment -->
<a href={p('/about')} {@attach isActiveLink()}>About</a>

<!-- Or if you want to stay with an action -->
<a href={p('/about')} use:isActiveLinkAction>About</a>
```
