// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
    server: {
        port: 4000
    },
    resolve: {
        tsconfigPaths: true
    },
    plugins: [
        tanstackStart(),
        // React's plugin must come after start's vite plugin.
        viteReact()
    ]
});
