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
