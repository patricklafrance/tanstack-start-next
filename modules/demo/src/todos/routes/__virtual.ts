import { defineVirtualSubtreeConfig, index, layout, route } from "@tanstack/virtual-file-routes";

export default defineVirtualSubtreeConfig([
    layout("todosLayout", "todosLayoutRoute.tsx", [
        index("todosListRoute.tsx"),
        route("/$todoId", "todoDetailLayoutRoute.tsx", [
            index("todoDetailRoute.tsx"),
            route("/edit", "todoEditRoute.tsx")
        ])
    ])
]);
