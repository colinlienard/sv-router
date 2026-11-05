---
'sv-router': patch
---

CLI now loads the Vite config with Vite itself instead of parsing it with a regex, so router options defined in variables, `.mts`/`.mjs` configs, or function configs are picked up
