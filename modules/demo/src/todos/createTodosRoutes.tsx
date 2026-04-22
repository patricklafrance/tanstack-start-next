import { createRoute, type AnyRoute } from "@tanstack/react-router";

export function createTodosRoutes(parentRoute: AnyRoute) {
    const todosRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: "/todos"
    });

    const todosIndexRoute = createRoute({
        getParentRoute: () => todosRoute,
        path: "/"
    }).lazy(() => import("./TodosList.lazy.tsx").then(d => d.Route));

    const todoDetailRoute = createRoute({
        getParentRoute: () => todosRoute,
        path: "$todoId"
    }).lazy(() => import("./TodoDetail.lazy.tsx").then(d => d.Route));

    const todoEditRoute = createRoute({
        getParentRoute: () => todosRoute,
        path: "$todoId/edit"
    }).lazy(() => import("./TodoEdit.lazy.tsx").then(d => d.Route));

    return [todosRoute.addChildren([todosIndexRoute, todoDetailRoute, todoEditRoute])];
}
