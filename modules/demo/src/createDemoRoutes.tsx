import type { AnyRoute } from "@tanstack/react-router";
import { createTodosRoutes } from "./todos/createTodosRoutes.tsx";

export function createDemoRoutes(parentRoute: AnyRoute) {
    return [...createTodosRoutes(parentRoute)];
}
