# Todos polish plan

Follow-up tasks after the Prisma/Neon persistence migration. Routing is now file-based via `virtualRouteConfig` + `physical()` in `apps/web/vite.config.ts`. Route files live at `modules/demo/src/todos/routes/_todosLayout.<path>.tsx`. All server functions live in `modules/demo/src/todos/Todos.server.ts`.

Do the steps in order. Each is independent enough to merge on its own.

---

## Step 1 — `createTodo` + inline form on list

**Goal:** let the user add a todo from the list page.

1. In `Todos.server.ts`, add next to the existing exports:

    ```ts
    export const createTodo = createServerFn({ method: "POST" })
        .inputValidator((d: { title: string; description: string | null }) => d)
        .handler(async ({ data }) => {
            await prisma.todo.create({ data });
        });
    ```

2. In `_todosLayout.index.tsx`:
    - Import `createTodo` from `../Todos.server.ts`.
    - Import `useRouter` from `@tanstack/react-router`, `useForm` from `@tanstack/react-form`, and the existing UI primitives (`TextField`, `Input`, `Label`, `Button`).
    - Define a `useForm` instance inside `TodosList` with `defaultValues: { title: "" }` and an `onSubmit` that calls `createTodo`, then `form.reset()`, then `router.invalidate()`.
    - Render a `<form>` above the existing `<ul>`. One `form.Field` for `title`, one submit `Button`.
    - Guard against empty titles client-side (trim + bail if empty).

**Verify:** type a title, click Create, new row appears at the bottom of the list (loader orders `asc` by `createdAt`). `_serverFn` POST visible in Network.

---

## Step 2 — `deleteTodo` on detail page

**Goal:** let the user delete a todo from its detail page.

1. In `Todos.server.ts`:

    ```ts
    export const deleteTodo = createServerFn({ method: "POST" })
        .inputValidator((d: { id: string }) => d)
        .handler(async ({ data }) => {
            await prisma.todo.delete({ where: { id: data.id } });
        });
    ```

2. In `_todosLayout.$todoId.index.tsx`:
    - Import `deleteTodo` from `../Todos.server.ts`, `useRouter` from `@tanstack/react-router`, `Button` from `@/components/ui/button.tsx`.
    - Inside the component, grab `useRouter()`.
    - Add a Delete button in the existing flex row, after Edit.
    - `onPress` handler: `window.confirm("Delete this todo?")` guard, `await deleteTodo({ data: { id: todo.id } })`, `await router.invalidate()`, `router.navigate({ to: "/todos" })`.

**Verify:** click Delete, confirm, land on `/todos` with the row gone. Re-navigating to the deleted id's URL gives a 404/error (expected).

---

## Step 3 — `completed` checkbox on edit form

**Goal:** user can toggle a todo's completed state from the edit form.

**Check first:** does `@/components/ui/checkbox.tsx` exist in `packages/intent-ui/src/components/ui/`? If not, add it via `pnpx shadcn@latest add @intentui/checkbox` from `apps/web/` (per CLAUDE.md).

1. In `_todosLayout.$todoId.edit.tsx`:
    - Import the Checkbox component.
    - Extend `useForm`'s `defaultValues`: add `completed: todo.completed`.
    - Extend the `onSubmit` payload: replace `completed: todo.completed` with `completed: value.completed`.
    - Add a third `form.Field` for `completed`:

        ```tsx
        <form.Field name="completed">
            {field => (
                <Checkbox name={field.name} isSelected={field.state.value} onChange={field.handleChange}>
                    Completed
                </Checkbox>
            )}
        </form.Field>
        ```

        (Exact Intent UI API — check `packages/intent-ui/src/components/ui/checkbox.tsx` for the prop names. `isSelected` / `onChange` is standard React Aria; Intent UI wraps that.)

**Verify:** open a todo, toggle the checkbox, save, detail page shows updated `Status: Done` / `Status: Not done`.

---

## Step 4 — `pendingComponent` / `errorComponent`

**Goal:** loader latency and errors have UI, not blank screens.

1. Build two small shared components in `modules/demo/src/todos/routes/` (or colocate inline if you prefer for a POC):
    - `<RoutePending />` — a centered spinner + "Loading…" text. Use Intent UI or a plain Tailwind `animate-spin` div.
    - `<RouteError error={error} />` — heading "Something went wrong", render `error.message`, and a Back link to `/todos`.

2. Attach to the two loader-bearing routes:
    - `_todosLayout.index.tsx` route options:

        ```ts
        export const Route = createFileRoute("/todos/_todosLayout/")({
            loader: () => getTodos(),
            component: TodosList,
            pendingComponent: RoutePending,
            errorComponent: RouteError
        });
        ```

    - `_todosLayout.$todoId.tsx` route options: same two keys.

3. Throttle the loader to see the pending state: in Chrome devtools, Network → Slow 3G. Navigate to `/todos` from `/` — pending UI should flash for a moment.

4. Trigger the error state: navigate to `/todos/does-not-exist`. `getTodoById` throws (`findUniqueOrThrow`), `errorComponent` should render.

---

## Side task — README reconciliation

Two Limitations entries became obsolete after pivoting to virtual file routes:

- `#### Loader data types don't reach lazy routes` — typed loaders work now (file-based generates a concrete `routeTree.gen.ts`).
- `#### Production build fails: manifest plugin requires a generated route tree` — resolved for the same reason.

Decide: delete them, or rewrite as a short "Pivot: code-based → virtual file routes" narrative in the README that preserves the findings and the reason they no longer bite. The corresponding Workarounds section (`### Loader data types via a per-route type alias`) can be deleted outright.

Not blocking; do whenever.
