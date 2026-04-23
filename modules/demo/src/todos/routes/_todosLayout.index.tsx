import { createFileRoute } from "@tanstack/react-router";
import { getTodos } from "../Todos.server.ts";

export const Route = createFileRoute("/todos/_todosLayout/")({
    loader: () => getTodos()
});
