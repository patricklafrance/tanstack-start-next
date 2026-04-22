// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig({
    server: {
        port: 4000
    },
    resolve: {
        tsconfigPaths: true
    },
    // ssr: {
    //     // Bundle all dependencies into the SSR output so the Netlify Lambda
    //     // does not rely on pnpm-linked node_modules at runtime.
    //     noExternal: true
    // },
    plugins: [
        netlify(),
        tailwindcss(),
        tanstackStart(),
        // React's plugin must come after start's vite plugin.
        viteReact()
    ]
});
