# Repo conventions for agents

- `@/` in any tsconfig path in this repo maps to `packages/intent-ui/src/`. It means "the design system", not "this workspace's src". Do not introduce app-local `@/` aliases.
- Run `pnpx shadcn@latest add @intentui/<name>` from `apps/web`, not from `packages/intent-ui`. The CLI uses the app's `components.json` to route the file into the package.
- When adding a new `modules/<name>`, verify it's covered by an `@source` glob in `apps/web/src/styles.css`. If it isn't, Tailwind classes in that module will silently fail to render.
- Upstream bugs already filed (do not re-file): shadcn-ui/ui#10461 (brownfield monorepo init with custom registry), shadcn-ui/ui#10462 (multi-segment scope import path construction).
