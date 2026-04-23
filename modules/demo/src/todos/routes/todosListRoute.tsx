import { createFileRoute } from "@tanstack/react-router";
import { getTodos } from "../Todos.server.ts";
import { TodosList } from "../TodosList.tsx";

export const Route = createFileRoute("/todos/_todosLayout/")({
    loader: () => getTodos(),
    component: TodosList
});
