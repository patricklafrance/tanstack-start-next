import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, "../..", "");
    Object.assign(process.env, env);

    return {
        server: {
            port: 4000
        },
        resolve: {
            tsconfigPaths: true
        },
        optimizeDeps: {
            // View https://github.com/vitejs/vite/issues/22303.
            include: [
                "react-aria-components/Breadcrumbs",
                "react-aria-components/Button",
                "react-aria-components/FieldError",
                "react-aria-components/Group",
                "react-aria-components/Input",
                "react-aria-components/Label",
                "react-aria-components/Link",
                "react-aria-components/Text",
                "react-aria-components/TextField",
                "react-aria-components/composeRenderProps",
                "@heroicons/react/24/solid",
                "@tanstack/react-form"
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
    };
});
