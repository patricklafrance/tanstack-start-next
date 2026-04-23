# tanstack-start-next

POC exploring TanStack Start limitations with a pnpm + Turborepo monorepo.

## Development

Requirements: Node >= 24, pnpm >= 10.

- Install: `pnpm install`
- Run the web app: `pnpm dev-web` (http://localhost:4000)
- Typecheck everything: `pnpm typecheck`
- Lint everything: `pnpm lint`

## Decisions and tradeoffs

### Routing is fully code-based

The entire route tree — app-local and module routes alike — is assembled in `apps/web/src/router.tsx` via `createRoute` + `addChildren`. TanStack Start's file-based route generator is disabled (`enableRouteGeneration: false` in `vite.config.ts`); `routes/__root.tsx` stays as the root route source, but no other file-based routes exist.

**Why fully code-based.** Start's file-based generator scans a single directory (`apps/web/src/routes/`) and does not cross workspace boundaries, so a module cannot drop a file into the routes folder. Three options were on the table:

- **A)** Thin file-based stub in `apps/web/src/routes/` that renders a component imported from the module. App owns route metadata; module owns the view.
- **B)** Mixed — file-based for app-local routes, code-based factories from modules attached on top. [GitHub issue #2154](https://github.com/TanStack/router/issues/2154) confirms the type registry doesn't pick up the code-based half, so `<Link to="...">` and typed `useParams` for module routes are silently degraded.
- **C)** Fully code-based — disable file-based generation entirely, build the whole tree in code.

We picked **C**: full type-safety end-to-end (inference flows through `getParentRoute()` chains) and route definitions live with the feature, not split across the app and the module.

**How it's organized.** Every feature exposes a single `create<Feature>Routes(parentRoute)` factory returning an array of routes:

- `@modules/demo` exports `createDemoRoutes` (entry: `modules/demo/src/createDemoRoutes.tsx`).
- App-local features follow the same shape — e.g. `apps/web/src/home/Home.tsx` exports `createHomeRoute`.
- `router.tsx` is a pure composer: `rootRoute.addChildren([createHomeRoute(rootRoute), ...createDemoRoutes(rootRoute)])`.
- Lazy components use `createLazyRoute` and are wired with `.lazy(() => import(...).then(d => d.Route))`.

**Tradeoffs we accept (vs. file-based):**

- Higher boilerplate per route — `getParentRoute`, child attachment, and the `Register` interface augmentation are all manual.
- No automatic code-splitting — opt in per route via `.lazy(...)`.
- Slower TS compiler performance as the tree grows — code-based routing relies on inference; file-based codegen short-circuits it.
- One quirk: index routes (`path: "/"` under a parent) have ids with a trailing slash (e.g. `/todos/`), so the matching `createLazyRoute("/todos/")` id needs the trailing slash too. Leaf routes don't.

**Trap to avoid:** the mixed approach (B) compiles and runs but silently degrades type-safety for module routes. If a future change reintroduces file-based routes alongside this code-based tree, expect `<Link to="...">` autocomplete to drop module routes from the union without warning.

## Design system

UI components come from [Intent UI](https://intentui.com), installed via the shadcn CLI into `packages/intent-ui`. Consumers (`apps/web`, modules) import them as `@/components/ui/<name>`.

### Add a new Intent UI component

From `apps/web/`:

```
pnpx shadcn@latest add @intentui/<name>
```

The file lands at `packages/intent-ui/src/components/ui/<name>.tsx`. Import via `@/components/ui/<name>`.

### Add a new module

1. Create `modules/<name>/` with a `package.json` named `@modules/<name>` (private, workspace version, `type: "module"`).
2. Declare `@packages/intent-ui` as a workspace dependency if the module uses design-system components.
3. If the module exposes routes, export a single `create<Name>Routes(parentRoute)` factory from its entry point and call it from `apps/web/src/router.tsx` — spread its return into `rootRoute.addChildren([...])`. See `modules/demo` for the reference shape.
4. Import into `apps/web` where it's needed.

Modules do not configure Tailwind and do not import CSS — the host app handles both. The app's `apps/web/src/styles.css` already has an `@source` glob covering `modules/*/src/**`; new modules are picked up automatically.

### Add a new storybook app

1. Scaffold under `apps/<module>-storybook/`.
2. Install `@tailwindcss/vite`.
3. Register the plugin in the storybook's Vite config.
4. Create a root CSS that imports `@packages/intent-ui/globals.css` and declares `@source` globs for the storybook's own src and the module(s) it loads.
5. Import that CSS in `.storybook/preview.ts`.

## Netlify

- Make sure that in the Netlify site, the base directory is `apps/web/`:

![](static/netlify-site-config.png)

- The `netlify()` Vite plugin is gated to `command === "build"` in `apps/web/vite.config.ts`. In dev, the plugin reads the linked Netlify site config and joins its `base = apps/web` against the local cwd, producing a non-existent `apps/web/apps/web` and aborting startup. The plugin is only needed for production deployment, so skipping it in dev is harmless and unblocks `pnpm dev-web`.

## Issues encountered

### shadcn

Multiple issues with the CLI:

- https://github.com/shadcn-ui/ui/issues/10461
- https://github.com/shadcn-ui/ui/issues/10462
- https://github.com/shadcn-ui/ui/issues/8991

### Tanstack Start

- https://github.com/TanStack/router/discussions/3449 (also https://developers.netlify.com/sdk/edge-functions/get-started#limitations)

Netlify function error:

```
The error is: Apr 21, 10:51:25 PM: c3d83970 ERROR  Invoke Error     {"errorType":"Error","errorMessage":"Cannot find package '@tanstack/react-router' imported from                         /var/task/apps/web/.netlify/v1/functions/server.mjs","code":"ERR_MODULE_NOT_FOUND","stack":["Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@tanstack/react-router' imported from       /var/task/apps/web/.netlify/v1/functions/server.mjs","    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:314:9)","    at packageResolve                             (node:internal/modules/esm/resolve:774:81)","    at moduleResolve (node:internal/modules/esm/resolve:861:18)","    at moduleResolveWithNodePath                                             (node:internal/modules/esm/resolve:991:14)","    at defaultResolve (node:internal/modules/esm/resolve:1034:79)","    at #cachedDefaultResolve                                               (node:internal/modules/esm/loader:731:20)","    at ModuleLoader.resolve (node:internal/modules/esm/loader:708:38)","    at ModuleLoader.getModuleJobForImport                               (node:internal/modules/esm/loader:310:38)","    at ModuleJob._link (node:internal/modules/esm/module_job:182:49)"]}
```

Bottom line... to deploy with the Netlify CLI, it would requires to somehow pre-build the server functions with something like tsdown or set `ssr.noExternal: true` in vite config, which have it's own downsides as well. But when using Netlify continuous deployments, it works.

### Tanstack Router

- Pathless layout route ids silently become part of every descendant's route id. A child's `createLazyRoute(...)` must include the pathless segment — e.g. `createLazyRoute("/todos/_todosLayout/$todoId")`, not `createLazyRoute("/todos/$todoId")`. Mismatched ids fail at runtime with "Failed to fetch dynamically imported module". The URL path is unchanged; only the route id shifts.

### Vite

- 504 Outdated Optimize Dep on lazy-route navigation: https://github.com/vitejs/vite/issues/22303

### Storybook

Issues with `storybook-addon-tanstack-start`:

- https://github.com/jonmumm/storybook-addon-tanstack-start/issues/7 — addon excludes `@tanstack/react-router` from `optimizeDeps`, which cascades into `use-sync-external-store/shim/with-selector` being served as raw CJS and failing the browser's named-import parse under pnpm.
- https://github.com/jonmumm/storybook-addon-tanstack-start/issues/8 — the root barrel transitively imports `plugin.mjs`, whose top-level `fileURLToPath(import.meta.url)` runs in the browser and throws. Workaround: import `tanstackRouterParameters` from `storybook-addon-tanstack-router` directly.

`storybook-addon-tanstack-start` doesn't support stubbing any server function:

- `createServerFn` stubs throw unconditionally and there is no documented per-story override. Stories can render with mocked loader data, but click/interaction flows that invoke server functions are a dead end without refactoring the component to expose a mockable boundary.
