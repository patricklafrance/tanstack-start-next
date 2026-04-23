import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/todos/_todosLayout/$todoId")({
    staticData: { crumb: m => `#${(m.params as { todoId: string }).todoId}` }
});
