# tanstack-start-next

POC exploring TanStack Start limitations with a pnpm + Turborepo monorepo.

## Development

Requirements: Node >= 24, pnpm >= 10.

- Install: `pnpm install`
- Run the web app: `pnpm dev-web` (http://localhost:4000)
- Typecheck everything: `pnpm typecheck`
- Lint everything: `pnpm lint`

## Storybook

- Run the unified Storybook: `pnpm dev-storybook` (http://localhost:6006)

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
3. If the module exposes routes, put them under `modules/<name>/src/<feature>/routes/` using file-based conventions (`index.tsx`, `_layout.tsx`, `$param.tsx`, etc.). Mount the directory from `apps/web/vite.config.ts`:

    ```ts
    // apps/web/vite.config.ts
    virtualRouteConfig: rootRoute("__root.tsx", [index("index.tsx"), physical("/<urlPrefix>", "../../../../modules/<name>/src/<feature>/routes")]);
    ```

    Paths in `physical()` are resolved relative to `apps/web/src/routes/`. See `modules/demo` for the reference shape.

4. Declare the module as a workspace dep of `apps/web` (`"@modules/<name>": "workspace:*"`) so pnpm materializes its own dependency tree even though the app doesn't import the package by name.

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

- Set `DATABASE_URL` and `DATABASE_URL_POOLER` in the site's environment variables (same values as the local `.env.local`).

## Database

The demo module persists todos in a Neon Postgres database via Prisma. Schema, migrations, and seed live in `modules/demo/prisma/`. All `pnpm prisma-*` scripts must be run from `modules/demo/`.

Assumes a single shared Neon database — no per-contributor branching convention yet.

### First-time setup

1. Create a project at [neon.tech](https://neon.tech) and copy the two connection strings (direct + pooled).
2. Create `.env.local` at the repo root:

    ```
    DATABASE_URL=<direct connection string>
    DATABASE_URL_POOLER=<pooled connection string>
    ```

    Migrations require the direct URL (PgBouncer transaction pooling breaks DDL); runtime uses the pooled URL.

3. From `modules/demo/`: `pnpm prisma-migrate` to apply migrations.
4. Optional — seed demo data: `pnpm prisma-seed`.

### Schema changes

1. Edit `modules/demo/prisma/schema.prisma`.
2. From `modules/demo/`: `pnpm prisma-migrate` — creates the migration, applies it, regenerates the client.
3. Commit the new folder under `modules/demo/prisma/migrations/`.

### Production migrations

Run `pnpm prisma-migrate-deploy` from `modules/demo/` against the production Neon branch. Deliberately manual, not wired into the Netlify build: the build runs in `apps/web` and has no knowledge of `modules/demo`'s Prisma scripts, and auto-applying DDL during a routine site deploy is the wrong default.

## Routing

Routes are file-based via TanStack Router's generator, with module route directories mounted through [virtual file routes](https://tanstack.com/router/latest/docs/framework/react/routing/virtual-file-routes). The generator watches `apps/web/src/routes/` as its nominal `routesDirectory`, and `virtualRouteConfig` in `apps/web/vite.config.ts` uses `physical()` to mount `modules/<name>/src/<feature>/routes/` directories at their URL prefixes. Every file under those directories gets generated into `apps/web/src/routeTree.gen.ts` — the single source of truth for the router.

Conventions used (flat-file style):

- `index.tsx` — index route at the parent path.
- `$param.tsx` — dynamic segment.
- `_layout.tsx` — pathless layout (renders `<Outlet />` to children).
- `foo.bar.tsx` — dots flatten the tree: lives at `/foo/bar` under the parent.

`autoCodeSplitting` is on by default in the start plugin (it can't be disabled via `router` options — the start-plugin-core schema `omit`s the flag). Every route's `component` / `errorComponent` / `pendingComponent` / `notFoundComponent` is lazy-loaded into its own chunk; loaders, `beforeLoad`, `staticData`, and validators stay in the critical bundle so they can run in parallel with the lazy chunk fetch.

## Limitations

### Pathless layout ids propagate to descendants

Pathless layout routes (file named `_foo.tsx`) contribute nothing to the URL, but the `_foo` segment is prepended to every descendant's route id. A child's file `_todosLayout.$todoId.edit.tsx` gets route id `/todos/_todosLayout/$todoId/edit` even though the URL is `/todos/$todoId/edit`. This matters anywhere you reference a route by id — e.g. `useLoaderData({ from: "/todos/_todosLayout/$todoId" })` — where the `_todosLayout` segment is load-bearing. Confirmed as working-as-designed upstream ([TanStack/router#2130](https://github.com/TanStack/router/issues/2130)). Not a bug; just a gotcha that refactors (renaming or removing a `_layout`) have to follow through every descendant file and every `from` string.

### Virtual routes + pnpm is under active maintenance

The sanctioned path for cross-workspace file-based routing (`virtualRouteConfig` + `physical()`) works, but has open upstream bugs around pnpm-hoisted package alias resolution ([TanStack/router#4984](https://github.com/TanStack/router/issues/4984)). This repo sidesteps that by using filesystem paths (`../../../../modules/...`) in `physical()` rather than workspace package specifiers. If you switch to package specifiers and hit resolution failures, #4984 is the tracking issue.

### Single-file `createFileRoute` + component breaks code splitting when the component is exported

The pattern the TanStack Router docs advertise co-locates the route definition and the component in one file:

```tsx
// idiomatic docs shape
export const Route = createFileRoute(...)({ component: TodoDetail });
function TodoDetail() { ... } // local, NOT exported
```

The code splitter refuses to split `component:` when the referenced identifier is exported from the same file. Relevant check in `@tanstack/router-plugin/.../code-splitter/compilers.js`:

```js
if (t.isIdentifier(value)) {
    const isExported = hasExport(ast, value);
    shouldSplit = !isExported;
}
```

Storybook stories in this repo import components by name (`import { TodoDetail } from "./TodoDetail"`), so the component has to be exported. That forces a two-file shape per route:

- `modules/demo/src/todos/TodoDetail.tsx` — component, named export (Storybook imports from here)
- `modules/demo/src/todos/routes/todoDetailRoute.tsx` — `createFileRoute(...)({ component: TodoDetail })`, nothing else exported

Measured impact of attempting the single-file merge: client collapsed into one 475 kB `index.js`. The two-file shape yields a 258 kB critical path plus per-route lazy chunks (`todoEditRoute-*.js` at 52 kB, etc.). Not tracked as an upstream bug — intentional splitter behavior — but worth documenting because it quietly contradicts the docs whenever a component also needs a named export for tests or stories.

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

Bottom line... to deploy with the Netlify CLI, it would requires to somehow pre-build the server functions with something like tsdown or set `ssr.noExternal: true` in vite config, which have it's own downsides as well. Git-based CD has the same issue — it runs the same `vite build` command.

Note: this `ERR_MODULE_NOT_FOUND` is a **runtime** failure, downstream of a successful build producing a `server.mjs`. The build itself succeeds (file-based routing produces the `routeTree.gen.ts` the manifest plugin needs); the error only surfaces when the CLI-built artifact is invoked.

### Vite

- 504 Outdated Optimize Dep on lazy-route navigation: https://github.com/vitejs/vite/issues/22303

### Storybook

Issues with `storybook-addon-tanstack-start`:

- https://github.com/jonmumm/storybook-addon-tanstack-start/issues/7 — addon excludes `@tanstack/react-router` from `optimizeDeps`, which cascades into `use-sync-external-store/shim/with-selector` being served as raw CJS and failing the browser's named-import parse under pnpm.
- https://github.com/jonmumm/storybook-addon-tanstack-start/issues/8 — the root barrel transitively imports `plugin.mjs`, whose top-level `fileURLToPath(import.meta.url)` runs in the browser and throws. Workaround: import `tanstackRouterParameters` from `storybook-addon-tanstack-router` directly.

`storybook-addon-tanstack-start` doesn't support stubbing any server function:

- `createServerFn` stubs throw unconditionally and there is no documented per-story override. Stories can render with mocked loader data, but click/interaction flows that invoke server functions are a dead end without refactoring the component to expose a mockable boundary.

### Intent UI

Issues:

- Docs is outdated for Tanstack Router link support: https://github.com/intentui/intentui/issues/629

## Workarounds

Every subsection below is a live workaround this repo carries to build, run, or deploy. They map 1:1 to the issues above.

### shadcn multi-segment scope import paths (shadcn-ui/ui#10462)

The CLI builds import paths from `components.json` aliases; multi-segment scopes like `@packages/intent-ui` confuse it. Alias `@/` to the design-system's src in **every** tsconfig in the repo, overriding the "this workspace's src" convention:

```json
// apps/web/tsconfig.json, modules/demo/tsconfig.json
"paths": {
    "@/*": ["../../packages/intent-ui/src/*"]
}
```

```json
// packages/intent-ui/tsconfig.json
"paths": {
    "@/*": ["./src/*"]
}
```

Every new workspace needs this line or files generated by the CLI will have unresolvable imports.

### shadcn ignores `rsc: false` (shadcn-ui/ui#8991)

`components.json` has `"rsc": false` but the CLI still writes `"use client"` directives at the top of every generated file:

```tsx
// packages/intent-ui/src/components/ui/link.tsx (and every other UI component)
"use client";

import { Link as LinkPrimitive, ... } from "react-aria-components/Link";
```

Left in place — the directive is a no-op in this non-RSC setup, and scrubbing it after every `add` is more friction than value. Just noise every code reviewer has to ignore.

### TanStack Start + Netlify CLI deploy (TanStack/router#3449)

Local `netlify deploy` errors because the built server function can't resolve `@tanstack/react-router` under pnpm's isolated layout:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@tanstack/react-router'
  imported from /var/task/apps/web/.netlify/v1/functions/server.mjs
```

No code fix applied. The "workaround" is procedural: **use Netlify continuous deployment only**. Alternatives (`tsdown` pre-build of the server fn, `ssr.noExternal: true` in Vite config) each introduce their own regressions.

### Netlify Vite plugin in dev

The Netlify Vite plugin reads the linked site's `base = apps/web` and joins it against the current working directory, producing `apps/web/apps/web` and aborting the dev server. Gated by Vite command:

```ts
// apps/web/vite.config.ts
export default defineConfig(() => ({
    plugins: [
        tailwindcss(),
        tanstackStart({ router: { virtualRouteConfig } }),
        viteReact(),
        netlify() // gated elsewhere in the config to command === "build"
    ]
}));
```

A plugin that aborts by default in dev, gated by a string comparison, is not a normal shape for Vite configuration.

### Vite 504 Outdated Optimize Dep (vitejs/vite#22303)

Lazy-route navigations discover new `react-aria-components/*` subpaths, Vite's optimizer re-bundles mid-session, and in-flight module requests 504. Counter: enumerate every subpath used anywhere in the app up-front so the optimizer sees the full set at boot:

```ts
// apps/web/vite.config.ts
optimizeDeps: {
    include: [
        "react-aria-components/Breadcrumbs",
        "react-aria-components/Button",
        "react-aria-components/FieldError",
        "react-aria-components/Group",
        "react-aria-components/Input",
        "react-aria-components/Label",
        "react-aria-components/Link",
        "react-aria-components/Text",
        "react-aria-components/TextField",
        "react-aria-components/composeRenderProps",
        "@heroicons/react/24/solid"
    ];
}
```

Same failure mode applies to `@heroicons/react` subpaths (`/24/solid`, `/24/outline`, `/20/solid`) — each one first reached via a lazy navigation triggers the same 504. Every new react-aria-components or heroicons subpath added anywhere in the app must also be added to `include`, or a lazy navigation deep in the tree will surface a 504 long after the PR merges.

Under pnpm's isolated layout there's a second trap: `optimizeDeps.include` silently no-ops for specifiers that can't be resolved from the app's root. `@heroicons/react` is a dep of `@packages/intent-ui`, not `apps/web`, so no symlink exists at `apps/web/node_modules/@heroicons/` and the pre-bundle scan drops the entry without warning. Lazy navigation through a component that renders breadcrumbs then _discovers_ it for the first time, triggers re-optimization, invalidates the browser's in-flight `?v=` hashes, and surfaces the 504. Counter: declare the transitive design-system dep as a direct dep of `apps/web` so pnpm materializes the link:

```jsonc
// apps/web/package.json
"dependencies": {
    "@heroicons/react": "2.2.0",
    ...
}
```

Same rule as the `use-sync-external-store` workaround below — anything listed in `optimizeDeps.include` must also be reachable from the workspace doing the optimizing. Both pieces are needed: the `include` entry tells the optimizer to pre-bundle the subpath, and the direct dep tells pnpm to make it resolvable.

### Storybook addon pre-bundles break in pnpm (jonmumm/storybook-addon-tanstack-start#7)

The addon puts `@tanstack/react-router` in `optimizeDeps.exclude`, which cascades into the transitive `use-sync-external-store/shim/with-selector` being served as raw CJS. Under pnpm that module isn't hoisted as a direct bare specifier, so a plain `optimizeDeps.include` entry alone can't resolve it. Two edits, both in `apps/storybook-demo/`:

```jsonc
// apps/storybook-demo/package.json
"dependencies": {
    "use-sync-external-store": "1.6.0",
    ...
}
```

```ts
// apps/storybook-demo/vite.config.ts
optimizeDeps: {
    include: ["use-sync-external-store/shim/with-selector"];
}
```

A direct dep on a transitive CJS helper of a transitive dep of a Storybook addon. That's the level at which the stack requires intervention.

### Storybook addon root barrel pulls Node into browser (jonmumm/storybook-addon-tanstack-start#8)

The addon's root barrel `storybook-addon-tanstack-start` transitively imports `plugin.mjs`, whose module top-level calls `fileURLToPath(import.meta.url)` — a Node API externalized (and broken) in the browser. The addon's subpath exports (`/plugin`, `/preview`, `/stubs`) don't expose `tanstackRouterParameters`, so reaching it without the barrel means importing from the underlying package:

```tsx
// modules/demo/src/counter/Counter.stories.tsx
// NOT: import { tanstackRouterParameters } from "storybook-addon-tanstack-start"
import { tanstackRouterParameters } from "storybook-addon-tanstack-router";
```

```jsonc
// modules/demo/package.json — story file lives here, so the dep must live here too
"devDependencies": {
    "storybook-addon-tanstack-router": "0.1.0",
    ...
}
```

The dep has to be declared in **the module that owns the story**, not the Storybook app, because Vite resolves bare specifiers relative to the source file's workspace. Not obvious, and trips up anyone following the Storybook app conventions for addon setup.

### Storybook addon `createServerFn` stubs throw unconditionally

No workaround exists. The addon's default stub is hardcoded to throw, and there is no documented per-story override API:

```ts
// node_modules/storybook-addon-tanstack-start/dist/mocks/start-stubs.mjs
const createServerFn = () => {
    const builder = {
        ...
        handler: () => async () => {
            throw new Error("createServerFn not available in Storybook");
        }
    };
    return builder;
};
```

Click/interaction stories for Start-backed components are simply not built. Loader-driven render stories work; that's where the capability ends.

### Module route files have to include the host app's `routeTree.gen.ts`

Route files under `modules/<name>/src/<feature>/routes/` reference registry-driven APIs (`createFileRoute("/some/id")`, `useLoaderData({ from: "..." })`) whose types come from the `declare module` augmentation in `apps/web/src/routeTree.gen.ts`. If the module's `tsconfig.json` can't see that file, those APIs don't typecheck in isolation — `createFileRoute` rejects every path string because `FileRoutesByPath` is empty.

Earlier setup excluded `src/**/routes/**` from the module's `tsconfig.json` to dodge this, which had a worse side effect: VSCode's TS server opened route files in an **inferred project** with no `paths` mapping, so every `@/components/ui/<name>` import showed "Cannot find module" red-squiggles even though `pnpm lint` was green. The fix is to include the generated file explicitly so the augmentation flows in:

```jsonc
// modules/demo/tsconfig.json
{
    "compilerOptions": {
        "paths": { "@/*": ["../../packages/intent-ui/src/*"] }
    },
    "include": ["src/**/*", "../../apps/web/src/routeTree.gen.ts"],
    "exclude": ["dist", "node_modules", "**/*.stories.tsx"]
}
```

Soft coupling from `modules/demo` → `apps/web` at the type layer. That coupling already exists at runtime (`apps/web` is the only consumer), so making it explicit in the tsconfig is the lesser evil compared to the editor blind spot.

### `useLoaderData({ from })` returns `any` in module typecheck context

Flushing out the tsconfig above exposed that inside `modules/demo`, `useLoaderData({ from: "..." })` resolves to `any` even though `FileRoutesByPath[<id>]` is populated correctly (path strings are validated; the loader-data type isn't). Not apparent before because `apps/web`'s typecheck doesn't actually load modules/demo route files — `routeTree.gen.ts` uses `@ts-nocheck` + dynamic `import('...')`, which lets `tsc` skip full resolution of the imported route modules (confirmed via `tsc --listFiles`). Plausible root cause: `pnpm` resolves `@tanstack/react-router` to two physical copies under `.pnpm/` because `apps/web` has it as a direct dep while `modules/demo` has it as a peer dep — the registry augmentation attaches to one copy, the `useLoaderData` generic resolves through the other.

Same failure mode as ["Loader data types didn't reach lazy routes"](#loader-data-types-didnt-reach-lazy-routes) in the code-based annex below — file-based routing was supposed to fix it, and does in `apps/web`. Workaround is the same as the pre-migration one: derive the type locally from the server function and cast at the call site.

```tsx
// modules/demo/src/todos/routes/_todosLayout.index.lazy.tsx
import { useLoaderData } from "@tanstack/react-router";
import type { getTodos } from "../Todos.server.ts";

type Todos = Awaited<ReturnType<typeof getTodos>>;

const todos = useLoaderData({ from: "/todos/_todosLayout/" }) as Todos;
```

Only surfaces on callback-demanding use sites (`.map(t => ...)`) because property access on `any` silently compiles. Sibling files that only do `todo.title` look fine but carry the same untyped loader data.

### Intent UI docs outdated for TanStack Router (intentui/intentui#629)

The docs describe a TSR integration API that no longer matches reality. We stopped consulting them and read `react-aria-components` source directly to confirm the generated `Link` already works, then wire TSR on top at the call site:

```tsx
// packages/intent-ui/src/components/ui/link.tsx (stock, unmodified)
import { Link as LinkPrimitive } from "react-aria-components/Link";
export function Link({ ... }: LinkProps) { return <LinkPrimitive ... />; }
```

```tsx
// modules/demo/src/todos/routes/_todosLayout.$todoId.edit.tsx — wrap at use-site
import { createLink } from "@tanstack/react-router";
import { Link as IntentLink } from "@/components/ui/link.tsx";
const Link = createLink(IntentLink);
```

The docs being wrong means every TSR + Intent UI integration discovery is done by reading source. That cost is ongoing — it applies to every new component, not just `Link`.

## Annex: why we moved off code-based routing

The repo was built code-based first because file-based's default generator scans a single directory (`apps/web/src/routes/`) and doesn't cross workspace boundaries — so a module under `modules/<name>/` couldn't contribute routes through the default setup. Virtual file routes (`virtualRouteConfig` + `physical()`) eventually turned out to be the sanctioned escape hatch, and the current setup uses them. Keeping the earlier record here so future-me remembers what specifically went wrong with the code-based path — every bullet below is something we actually hit in this repo.

### File-based + code-based cannot be mixed safely

Early attempt: "just use file-based for the app and code-based for modules." [TanStack/router#2154](https://github.com/TanStack/router/issues/2154) reports that the type registry (generated from the file tree) doesn't pick up code-based routes added via `addChildren`. `<Link to="...">` autocomplete and typed `useParams` silently drop those routes from the union. No warning, no type error — it compiles. The issue was closed by the reporter without a fix PR; the architecture (generated `routeTree.gen.ts` from files only) inherently excludes `addChildren` routes, and virtual routes are the sanctioned way to bring them into the registry. Fully code-based or fully file-based (incl. virtual); no ad-hoc mixing.

### Every route was manual

`getParentRoute`, `addChildren`, lazy wiring via `.lazy(() => import(...).then(d => d.Route))`, and `declare module "@tanstack/react-start"` / `Register` augmentation all had to be hand-written. File-based scaffolding was unavailable.

### No automatic code-splitting

File-based routing splits by default. Code-based doesn't. Every split was explicit — `.lazy(...)` per route, or nothing.

### TS compiler slowed as the route tree grew

Code-based routing relies on inference through `getParentRoute()` chains — confirmed by the maintainers as existing primarily for TypeScript typing inference ([discussion #585](https://github.com/TanStack/router/discussions/585)). File-based codegen short-circuits that work by emitting a concrete `routeTree.gen.ts`. TanStack Router has documented TS-perf gotchas on the consumer side (e.g. [#1091](https://github.com/TanStack/router/issues/1091)), and directionally, deeper `getParentRoute` chains mean more inference per file.

### Route id quirks had to be tracked manually

Two cases where the route id diverged from what a reader would expect, and the lazy side had to match it character-for-character:

- **Index routes** (`path: "/"` under a parent) had ids with a trailing slash (`/todos/`). `createLazyRoute("/todos/")` needed the slash; `createLazyRoute("/todos")` silently didn't match.
- **Pathless layout routes** (declared with `id: "_foo"` instead of `path`) contributed nothing to the URL but their id was prepended to every descendant's route id. The `createLazyRoute(...)` string on each descendant had to include that segment or the chunk wouldn't resolve.

Both failed at runtime with "Failed to fetch dynamically imported module" — not at build time.

Applied to every lazy route under `modules/demo/src/todos/`:

```ts
// modules/demo/src/todos/createTodosRoutes.tsx (pre-migration)
const todosLayoutRoute = createRoute({
    getParentRoute: () => todosRoute,
    id: "_todosLayout",
    component: TodosLayout
});
```

```ts
// modules/demo/src/todos/TodoEdit.lazy.tsx (pre-migration)
// URL is /todos/:todoId/edit. Route id is /todos/_todosLayout/$todoId/edit.
export const Route = createLazyRoute("/todos/_todosLayout/$todoId/edit")({
    component: TodoEdit
});
```

The URL and the id diverged. Refactoring the layout id or removing the pathless wrapper meant updating every descendant's lazy id by hand or navigation broke. The id-prepending rule is **still** in effect with file-based routing (see "Pathless layout ids propagate to descendants" in the current Limitations), but the generator handles the id construction, so the refactor-follow-through pain is gone.

### Loader data types didn't reach lazy routes

`useLoaderData()` in a `*.lazy.tsx` file returned `unknown`. The route's loader return type didn't propagate from the registered `routeTree` through to lazy consumers. Same root cause as [TanStack/router#2154](https://github.com/TanStack/router/issues/2154) above (the type registry was designed around file-based codegen), surfaced on the data side instead of the link side: trees assembled via `addChildren` aren't fully visible to the lookups TSR performs for `useLoaderData`. Tracked in [TanStack/router discussions#1732](https://github.com/TanStack/router/discussions/1732).

Alternatives that didn't fix it:

- `getRouteApi(id).useLoaderData()` — same registry gap, same `unknown`.
- `RouteById<RegisteredRouter["routeTree"], id>["types"]["loaderData"]` — reaches into internal types not covered by semver, and still resolves through the same broken registry.
- Casting consumers to a raw Prisma model type (`as TodoModel`) — couples every consumer to the schema, so any `select`/`include` narrowing silently becomes a lie.

The workaround in use was a per-route type alias derived from the server function, exported from the critical file:

```tsx
// modules/demo/src/todos/TodosList.tsx (critical, pre-migration)
export const getTodos = createServerFn({ method: "GET" }).handler(() => {
    return prisma.todo.findMany({ orderBy: { createdAt: "asc" } });
});

export type TodosLoaderData = Awaited<ReturnType<typeof getTodos>>;
```

```tsx
// modules/demo/src/todos/TodosList.lazy.tsx (lazy, pre-migration)
import type { TodosLoaderData } from "./TodosList.tsx";

const todos = routeApi.useLoaderData() as TodosLoaderData;
```

Every new route with a loader carried its own `<Name>LoaderData` export. With file-based routing, the generated registry types `useLoaderData({ from: "..." })` directly from the route's loader return type, so the casts and the exported aliases are gone.

### Production build failed: manifest plugin required a generated route tree

`pnpm build-web` failed in the SSR phase with:

```
[plugin tanstack-start:start-manifest-plugin]
TypeError: Cannot convert undefined or null to object
    at Object.entries (<anonymous>)
    at buildRouteManifestRoutes (.../start-manifest-plugin/manifestBuilder.js:171)
```

The plugin does `Object.entries(options.routeTreeRoutes)`. With `enableRouteGeneration: false`, no `routeTree.gen.ts` was produced, `routeTreeRoutes` was `undefined`, and the plugin crashed. Client bundle completed; only the SSR environment blew up. Same `vite build` ran locally, via `netlify deploy --build`, and in Netlify CD — so `pnpm build-web`, `pnpm deploy-web`, and Git-based deploys all failed at the same point. Upstream: [TanStack/router#5808](https://github.com/TanStack/router/issues/5808), closed as not planned. This was ultimately the blocker that forced the move to virtual file routes; no POC workaround existed.
