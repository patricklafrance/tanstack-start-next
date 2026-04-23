import type { AnyRouteMatch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

declare module "@tanstack/react-router" {
    interface StaticDataRouteOption {
        crumb?: string | ((match: AnyRouteMatch) => string);
    }
}

export const Route = createFileRoute("/todos/_todosLayout")({
    staticData: { crumb: "Todos" }
});
