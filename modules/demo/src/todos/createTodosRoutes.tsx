import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { TodosLayout } from "./TodosLayout.tsx";

export function createTodosRoutes(parentRoute: AnyRoute) {
    const todosRoute = createRoute({
        getParentRoute: () => parentRoute,
        path: "/todos"
    });

    const todosLayoutRoute = createRoute({
        getParentRoute: () => todosRoute,
        // Providing an "id" rather than a "path" make this route pathless.
        id: "_todosLayout",
        component: TodosLayout,
        staticData: { crumb: "Todos" }
    });

    const todosIndexRoute = createRoute({
        getParentRoute: () => todosLayoutRoute,
        path: "/"
    }).lazy(() => import("./TodosList.lazy.tsx").then(d => d.Route));

    // No component — TanStack Router defaults to rendering <Outlet />, so this acts as a parent
    // layout for the detail and edit views and contributes the "#<todoId>" crumb to the chain.
    const todoDetailRoute = createRoute({
        getParentRoute: () => todosLayoutRoute,
        path: "$todoId",
        staticData: { crumb: m => `#${(m.params as { todoId: string }).todoId}` }
    });

    const todoDetailIndexRoute = createRoute({
        getParentRoute: () => todoDetailRoute,
        path: "/"
    }).lazy(() => import("./TodoDetail.lazy.tsx").then(d => d.Route));

    const todoEditRoute = createRoute({
        getParentRoute: () => todoDetailRoute,
        path: "edit",
        staticData: { crumb: "Edit" }
    }).lazy(() => import("./TodoEdit.lazy.tsx").then(d => d.Route));

    return [todosRoute.addChildren([todosLayoutRoute.addChildren([todosIndexRoute, todoDetailRoute.addChildren([todoDetailIndexRoute, todoEditRoute])])])];
}
