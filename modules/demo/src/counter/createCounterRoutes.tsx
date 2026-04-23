import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { getCount } from "./Counter.tsx";

export function createCounterRoutes(parentRoute: AnyRoute) {
    const counterRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: "/counter",
        loader: async () => await getCount()
    }).lazy(() => import("./Counter.lazy.tsx").then(d => d.Route));

    return [counterRoute];
}
