import { createFileRoute } from "@tanstack/react-router";
import { getTodoById } from "../Todos.server.ts";

export const Route = createFileRoute("/todos/_todosLayout/$todoId")({
    loader: ({ params }) => getTodoById({ data: params.todoId }),
    staticData: { crumb: m => `#${(m.params as { todoId: string }).todoId}` }
});
