// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig(() => ({
    server: {
        port: 4000
    },
    resolve: {
        tsconfigPaths: true
    },
    optimizeDeps: {
        // Pre-bundle every react-aria-components subpath used by intent-ui so Vite doesn't lazily re-optimize one
        // (and bump its ?v= hash) the first time a route imports it. Without this, the first navigation to a route
        // that pulls a not-yet-seen subpath races: Vite re-optimizes the subpath, bumps its hash, but the already-served
        // intent-ui wrapper (e.g. button.tsx) still references the previous hash → 504 Outdated Optimize Dep → the
        // dynamic chunk fails to evaluate → "Failed to fetch dynamically imported module".
        include: [
            "react-aria-components/Button",
            "react-aria-components/FieldError",
            "react-aria-components/Group",
            "react-aria-components/Input",
            "react-aria-components/Label",
            "react-aria-components/Link",
            "react-aria-components/Text",
            "react-aria-components/TextField",
            "react-aria-components/composeRenderProps"
        ]
    },
    plugins: [
        tailwindcss(),
        tanstackStart({
            router: {
                enableRouteGeneration: false
            }
        }),
        // React's plugin must come after start's vite plugin.
        viteReact(),
        netlify()
    ]
}));
