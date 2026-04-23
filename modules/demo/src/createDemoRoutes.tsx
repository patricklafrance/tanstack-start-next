import type { AnyRoute } from "@tanstack/react-router";
import { createCounterRoutes } from "./counter/createCounterRoutes.tsx";
import { createTodosRoutes } from "./todos/createTodosRoutes.tsx";

export function createDemoRoutes(parentRoute: AnyRoute) {
    return [...createCounterRoutes(parentRoute), ...createTodosRoutes(parentRoute)];
}
