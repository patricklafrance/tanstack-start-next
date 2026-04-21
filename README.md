# tanstack-start-next

POC exploring TanStack Start limitations with a pnpm + Turborepo monorepo.

## Development

Requirements: Node >= 24, pnpm >= 10.

- Install: `pnpm install`
- Run the web app: `pnpm dev-web` (http://localhost:4000)
- Typecheck everything: `pnpm typecheck`
- Lint everything: `pnpm lint`

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
3. Import into `apps/web` where it's needed.

Modules do not configure Tailwind and do not import CSS — the host app handles both. The app's `apps/web/src/styles.css` already has an `@source` glob covering `modules/*/src/**`; new modules are picked up automatically.

### Add a new storybook app

1. Scaffold under `apps/<module>-storybook/`.
2. Install `@tailwindcss/vite`.
3. Register the plugin in the storybook's Vite config.
4. Create a root CSS that imports `@packages/intent-ui/globals.css` and declares `@source` globs for the storybook's own src and the module(s) it loads.
5. Import that CSS in `.storybook/preview.ts`.
