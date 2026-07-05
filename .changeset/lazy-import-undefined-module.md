---
"sv-router": patch
---

Throw a descriptive error when a lazy route import resolves to nothing (e.g. after a `vite:preloadError` is prevented via `event.preventDefault()`) instead of a cryptic `Cannot read properties of undefined (reading 'default')`
