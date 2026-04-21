// vite.config.ts
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    server: {
        port: 4000
    },
    resolve: {
        tsconfigPaths: true
    },
    plugins: [
        tailwindcss(),
        tanstackStart(),
        // React's plugin must come after start's vite plugin.
        viteReact()
    ]
});
