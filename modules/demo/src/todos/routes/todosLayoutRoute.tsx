import type { AnyRouteMatch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { TodosLayout } from "../TodosLayout.tsx";

declare module "@tanstack/react-router" {
    interface StaticDataRouteOption {
        crumb?: string | ((match: AnyRouteMatch) => string);
    }
}

export const Route = createFileRoute("/todos/_todosLayout")({
    component: TodosLayout,
    staticData: { crumb: "Todos" }
});
