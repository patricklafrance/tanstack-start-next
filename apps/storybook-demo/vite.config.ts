import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStartPlugin } from "storybook-addon-tanstack-start/plugin";

// Any story that transitively imports a `*.server.ts` file pulls `modules/demo/src/db/client.ts`
// into the browser graph, which imports `@prisma/client/runtime/client.mjs`. That runtime file
// calls `fileURLToPath(import.meta.url)` at module init — a Node API — and crashes the browser
// bundle with "fileURLToPath is not a function". The Storybook start addon stubs `createServerFn`
// so server-function handlers never actually execute in stories; this plugin extends the same
// stubbing principle one level deeper, replacing the real Prisma client with a Proxy that throws
// if anything ever calls it.
function stubDbClient(): Plugin {
    const STUB_ID = "\0virtual:db-client-stub";
    return {
        name: "stub-db-client-in-storybook",
        enforce: "pre",
        resolveId(source) {
            if (/(?:^|[\\/])db[\\/]client(\.ts)?$/.test(source)) {
                return STUB_ID;
            }
            return null;
        },
        load(id) {
            if (id !== STUB_ID) return null;
            return `
const throwOnCall = () => {
    throw new Error("Prisma is not available in Storybook — server functions that touch the database cannot run here.");
};
const prismaProxy = new Proxy(function () {}, {
    get() { return prismaProxy; },
    apply: throwOnCall
});
export const prisma = prismaProxy;
`;
        }
    };
}

export default defineConfig({
    resolve: {
        tsconfigPaths: true
    },
    plugins: [
        // Must be before the React plugin so React only ever sees code where the TanStack Start bits have already been stubbed.
        tanstackStartPlugin(),
        stubDbClient(),
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
