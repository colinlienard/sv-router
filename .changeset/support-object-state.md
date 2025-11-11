---
'sv-router': minor
---

Add support for history state as objects. The `state` parameter in `navigate()` and hooks now accepts any value (objects, arrays, strings, etc.) instead of just strings, matching the browser's native History API behavior.
