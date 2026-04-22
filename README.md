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

## Netlify

- Make sure that in the Netlify site, the base directory is `apps/web/`:

![](static/netlify-site-config.png)

## Issues encoutered

### shadcn

- https://github.com/shadcn-ui/ui/issues/10461
- https://github.com/shadcn-ui/ui/issues/10462
- https://github.com/shadcn-ui/ui/issues/8991

### Tanstack Start

- https://github.com/TanStack/router/discussions/3449 (also https://developers.netlify.com/sdk/edge-functions/get-started#limitations)

Netlify function error:

```
The error is: Apr 21, 10:51:25 PM: c3d83970 ERROR  Invoke Error     {"errorType":"Error","errorMessage":"Cannot find package '@tanstack/react-router' imported from                         /var/task/apps/web/.netlify/v1/functions/server.mjs","code":"ERR_MODULE_NOT_FOUND","stack":["Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@tanstack/react-router' imported from       /var/task/apps/web/.netlify/v1/functions/server.mjs","    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:314:9)","    at packageResolve                             (node:internal/modules/esm/resolve:774:81)","    at moduleResolve (node:internal/modules/esm/resolve:861:18)","    at moduleResolveWithNodePath                                             (node:internal/modules/esm/resolve:991:14)","    at defaultResolve (node:internal/modules/esm/resolve:1034:79)","    at #cachedDefaultResolve                                               (node:internal/modules/esm/loader:731:20)","    at ModuleLoader.resolve (node:internal/modules/esm/loader:708:38)","    at ModuleLoader.getModuleJobForImport                               (node:internal/modules/esm/loader:310:38)","    at ModuleJob._link (node:internal/modules/esm/module_job:182:49)"]}
```

Bottom line... to deploy with the Netlify CLI, it would requires to somehow pre-build the server functions with something like tsdown, but when using Netlify continuous deployments, it works.
