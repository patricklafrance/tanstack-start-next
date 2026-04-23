import { createLazyRoute, createLink, useLoaderData } from "@tanstack/react-router";
import { Heading } from "@/components/ui/heading.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";
import type { getTodos } from "../Todos.server.ts";

export const Route = createLazyRoute("/todos/_todosLayout/")({
    component: TodosList
});

const Link = createLink(IntentLink);

type Todos = Awaited<ReturnType<typeof getTodos>>;

export function TodosList() {
    const todos = useLoaderData({ from: "/todos/_todosLayout/" }) as Todos;

    return (
        <div>
            <Heading className="mb-4">Todos</Heading>
            <ul className="space-y-2">
                {todos.map(t => (
                    <li key={t.id}>
                        <Link to="/todos/$todoId" params={{ todoId: t.id }}>
                            {t.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
