import { createFileRoute } from "@tanstack/react-router";
import { getTodoById } from "../Todos.server.ts";
import { TodoEdit } from "../TodoEdit.tsx";

export const Route = createFileRoute("/todos/_todosLayout/$todoId/edit")({
    loader: ({ params }) => getTodoById({ data: params.todoId }),
    component: TodoEdit,
    staticData: { crumb: "Edit" }
});
