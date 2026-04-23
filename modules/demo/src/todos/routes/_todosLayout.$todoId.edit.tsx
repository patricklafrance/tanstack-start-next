import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/todos/_todosLayout/$todoId/edit")({
    staticData: { crumb: "Edit" }
});
