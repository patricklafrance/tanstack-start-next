import { createRouter } from "@tanstack/react-router";
import { Route as rootRoute } from "./routes/__root.tsx";
import { createHomeRoute } from "./Home.tsx";
import { createDemoRoutes } from "@modules/demo";
import { createCounterRoute } from "./Counter.tsx";

const routeTree = rootRoute.addChildren([createHomeRoute(rootRoute), createCounterRoute(rootRoute), ...createDemoRoutes(rootRoute)]);

export function getRouter() {
    const router = createRouter({
        routeTree,
        scrollRestoration: true
    });

    return router;
}

declare module "@tanstack/react-start" {
    interface Register {
        ssr: true;
        router: Awaited<ReturnType<typeof getRouter>>;
    }
}
