import { createFileRoute } from "@tanstack/react-router";
import { getTodoById } from "../Todos.server.ts";
import { TodoDetail } from "../TodoDetail.tsx";

export const Route = createFileRoute("/todos/_todosLayout/$todoId/")({
    loader: ({ params }) => getTodoById({ data: params.todoId }),
    component: TodoDetail
});
