import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStartPlugin } from "storybook-addon-tanstack-start/plugin";

export default defineConfig({
    resolve: {
        tsconfigPaths: true
    },
    plugins: [
        // Must be before the React plugin so React only ever sees code where the TanStack Start bits have already been stubbed.
        tanstackStartPlugin(),
        tailwindcss(),
        react()
    ],
    optimizeDeps: {
        // Force Vite to pre-bundle this CJS module as a direct target. Without it, the optimizer reaches it transitively
        // via @tanstack/react-store and emits `import { useSyncExternalStoreWithSelector } from ...`, which fails at
        // runtime because the CJS shim doesn't expose that name as an ESM export.
        include: ["use-sync-external-store/shim/with-selector"]
    }
});
