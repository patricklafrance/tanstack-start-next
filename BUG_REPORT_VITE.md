# [bug] Lazy route 504 — optimizeDeps re-optimizes a subpath export mid-navigation, baked-in `?v=` hash in a just-served module goes stale

## Describe the bug

When a lazy-loaded module (e.g. a dynamic `import()`) reaches a dependency subpath that Vite's dep optimizer hasn't seen yet, the optimizer re-runs mid-navigation and bumps the **per-chunk** `?v=` hash for that subpath. Any already-served module whose transformed output hard-codes the *previous* `?v=` for that subpath now points at a URL Vite rejects with `504 Outdated Optimize Dep`. The dynamic `import()` fails, surfacing to the browser as:

```
Uncaught TypeError: Failed to fetch dynamically imported module: .../Some.lazy.tsx
```

The root cause is not in the lazy module — it's in one of its **transitive** optimized-dep chunks whose hash is now stale relative to the module that imports it.

This is distinct from #17738 (missing chunk file on disk), #20609 (metadata/in-memory hash divergence across restarts), and #13506 (404-served-as-504). Those sit in the same failure family, but none describe **lazy mid-navigation subpath discovery causing hash bumps** as the trigger.

## Reproduction

Minimal repro: **https://github.com/patricklafrance/vite-rac-tsr-504-repro**

The real-world trigger in our repo:

- `apps/web` is a TanStack Start app (`@tanstack/react-start@1.167.42`).
- Route `/counter` is registered as a lazy route via TSR's `.lazy(() => import('./Counter.lazy.tsx'))`.
- `Counter.lazy.tsx` imports `<Button>` from an internal workspace package (`@packages/intent-ui`), which in turn does:
  ```ts
  import { Button as ButtonPrimitive } from "react-aria-components/Button";
  ```
- `react-aria-components@1.17.0` exposes each component as a distinct subpath export (`react-aria-components/Button`, `.../Link`, `.../Input`, …). Each becomes its own optimized-dep chunk (`node_modules/.vite/deps/react-aria-components_Button.js`) with its **own** `?v=` hash, independent from the parent package.
- Other routes use different subpaths (`.../Link` on `/`, `.../Heading` on `/todos`). The first visit to `/counter` is the first time `react-aria-components/Button` appears in the client module graph.

### Repro steps

1. `pnpm i && pnpm --filter @apps/web dev` (port 4000).
2. Open `/` — works. Open `/todos` — works.
3. Click the link to `/counter` (navigates to the lazy route for the first time).
4. Browser console shows:
   ```
   GET /node_modules/.vite/deps/react-aria-components_Button.js?v=<HASH_A>
       504 Outdated Optimize Dep
   Uncaught TypeError: Failed to fetch dynamically imported module:
       .../modules/demo/src/counter/Counter.lazy.tsx
   ```

### What the network tab shows

Requests during the failed navigation use **multiple different `?v=` hashes for different optimized deps**, which indicates the optimizer ran several times:

```
react.js                        ?v=3d6ef4f8
tailwind-merge.js               ?v=e6b1e506
tailwind-variants.js            ?v=524155cf
react-aria-components_Link.js   ?v=e2b427fe
react-aria-components_Button.js ?v=c2f17a43    ← 504
@tanstack/* chunks              ?v=81e69589
```

The `button.tsx` module served to the client (transformed by `@vitejs/plugin-react`) embeds the **old** hash for `react-aria-components/Button`, while the optimizer's current hash for that chunk is newer. Vite serves 504 for the old hash. The browser's dynamic `import()` for the lazy chunk fails because the fetch graph is broken.

## Expected behavior

Either:

1. Vite invalidates / re-transforms modules whose downstream optimized-dep hashes changed during a lazy discovery pass (so served `button.tsx` always references the current hash), **or**
2. Vite serves the current chunk regardless of `?v=` when only the hash has changed and the underlying content is equivalent.

Today the user has to manually enumerate every subpath in `optimizeDeps.include` to sidestep the race. For libraries with many subpaths (react-aria-components has ~40), this is error-prone — forgetting any subpath that's only imported on a rarely-visited lazy route leaves a latent 504 waiting.

## Current workaround

Pre-bundle every used subpath via `optimizeDeps.include`:

```ts
// vite.config.ts
optimizeDeps: {
  include: [
    "react-aria-components/Button",
    "react-aria-components/FieldError",
    "react-aria-components/Group",
    "react-aria-components/Input",
    "react-aria-components/Label",
    "react-aria-components/Link",
    "react-aria-components/Text",
    "react-aria-components/TextField",
    "react-aria-components/composeRenderProps",
  ],
}
```

This works because the subpaths are discovered at cold-start, not mid-navigation, so no hash bump occurs after any transform has been served. It's brittle (drift risk when new subpaths are imported) and relies on community lore — nothing in Vite's docs, TanStack Start's docs, or React Aria's docs mentions this is necessary.

## System Info

```
System:
  Node:  v24.13.0
  Pnpm:  v10.30.1
  OS:    Windows 11 Enterprise (26200)
Binaries:
  vite@8.0.9
  @vitejs/plugin-react@6.0.1
  @tanstack/react-start@1.167.42
  react-aria-components@1.17.0
  react@19.2.5
  react-dom@19.2.5
```

Package manager: pnpm workspaces (see repro for full `pnpm-workspace.yaml`).

## Used package manager

pnpm

## Validations

- [x] Follow [code of conduct](https://github.com/vitejs/vite/blob/main/CODE_OF_CONDUCT.md)
- [x] Read [contributing guidelines](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md)
- [x] Read [docs](https://vitejs.dev/guide/)
- [x] Checked existing issues (closest: #17738, #20609, #13506, discussion #14801 — related family, none match this lazy-subpath-discovery trigger)

## Related

- #17738 — missing `.vite/deps/chunk*` (disk-level staleness, different trigger)
- #20609 — metadata/in-memory hash divergence across restarts (fixed)
- #13506 — 504 vs 404 semantics (cosmetic)
- #14284 — 504 after `--force` race (restart-triggered)
- discussion #14801 — "optimized dependencies changed and reloading many times" (closest, but focused on the reload storm, not the 504 failure surface)
