# Fix `useLoaderData({ from })` returning `any` project-wide

## Root cause

`@tanstack/router-core/dist/esm/router.d.ts` defines:

```ts
export interface Register {}
export type RegisteredRouter<TRegister = Register> =
    TRegister extends { router: infer TRouter } ? TRouter : AnyRouter;
```

The auto-generated `apps/web/src/routeTree.gen.ts` augments `Register` in the wrong module:

```ts
declare module '@tanstack/react-start' {
    interface Register { ssr: true; router: Awaited<ReturnType<typeof getRouter>> }
}
```

Module augmentations create new interfaces in the target module's scope — they do not merge back into router-core's original `Register` through re-exports. So `RegisteredRouter` always falls back to `AnyRouter`, `RegisteredRouter['routeTree']` is `any`, and `useLoaderData({ from })` returns `any` for every route.

`FileRoutesByPath` augmentation works by coincidence because it's read via the react-router import path where the augmentation exists. `Register` is different — it's read from inside router-core's own types.

Has been silently broken project-wide. `apps/web`'s typecheck never loads module route files (`@ts-nocheck` + dynamic `import('...')` in routeTree.gen.ts lets tsc skip them), so the error never surfaced until `modules/demo` started typechecking its own route files.

## Fix

Add a project-owned `.d.ts` that augments `@tanstack/router-core`'s `Register` directly. Don't edit `routeTree.gen.ts` — it gets regenerated.

### 1. Add router-core as a devDep of `apps/web`

Required so the `declare module '@tanstack/router-core'` specifier resolves.

```jsonc
// apps/web/package.json
"devDependencies": {
    "@tanstack/router-core": "1.168.15",
    // ... existing
}
```

Pin to the version pnpm already resolved (check `node_modules/.pnpm/@tanstack+router-core@<version>/`).

### 2. Create the augmentation file

```ts
// apps/web/src/tanstack-register.d.ts
import type { getRouter } from "./router.tsx";

declare module "@tanstack/router-core" {
    interface Register {
        router: Awaited<ReturnType<typeof getRouter>>;
    }
}
```

### 3. Make `modules/demo` see it

```jsonc
// modules/demo/tsconfig.json
"include": [
    "src/**/*",
    "../../apps/web/src/routeTree.gen.ts",
    "../../apps/web/src/tanstack-register.d.ts"
]
```

`apps/web/tsconfig.json` doesn't need an explicit include — the file is under `apps/web/src/` which is already scanned.

### 4. Drop the workaround cast

In `modules/demo/src/todos/routes/_todosLayout.index.lazy.tsx`, remove:

```ts
import type { getTodos } from "../Todos.server.ts";
type Todos = Awaited<ReturnType<typeof getTodos>>;
// ...
const todos = useLoaderData({ from: "/todos/_todosLayout/" }) as Todos;
```

Replace with:

```ts
const todos = useLoaderData({ from: "/todos/_todosLayout/" });
```

### 5. Remove the matching README workaround section

Delete `### useLoaderData({ from }) returns any in module typecheck context` from `README.md` once the fix lands. Keep the `routeTree.gen.ts` include workaround — that one is still legitimate.

## Verification

1. `cd modules/demo && npx tsc --noEmit` — should pass without the cast.
2. Hover `todos` in VS Code in `_todosLayout.index.lazy.tsx` — should show the real loader return type, not `any`.
3. Same check in sibling lazy files (e.g. `_todosLayout.$todoId.index.lazy.tsx`) — `todo` should now be the real type, not silently `any` masked by property access.
4. `pnpm lint` from the root passes.

## Upstream report

File against TanStack Router. The route-tree generator's final `Register` augmentation targets `@tanstack/react-start` (or `@tanstack/react-router` in non-Start projects), but `RegisteredRouter` in `@tanstack/router-core` reads router-core's own empty `Register` — these don't connect. Generator should emit the augmentation against `@tanstack/router-core`, OR the framework packages should define their own `Register` interface that `RegisteredRouter` consults.

Reference files for the report:
- `node_modules/.pnpm/@tanstack+router-core@1.168.15/node_modules/@tanstack/router-core/dist/esm/router.d.ts` (lines 23–30) — empty `Register`, `RegisteredRouter` definition.
- `apps/web/src/routeTree.gen.ts` (lines 231–236) — wrong-target augmentation.

## Risks / caveats

- Manually pinned `@tanstack/router-core` version can drift from whatever `@tanstack/react-router` pulls transitively. Options: leave it as a devDep with a caret range (`^1.168.15`) to track upstream, or skip the direct dep and write the augmentation in ambient form without importing from the package specifier — but that's uglier. Caret range is fine.
- If TanStack eventually fixes the generator to augment router-core itself, the project-owned file becomes redundant (two augmentations merge harmlessly, but then it's just dead code).
