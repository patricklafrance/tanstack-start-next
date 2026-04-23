import { createLazyRoute, createLink } from "@tanstack/react-router";
import { Heading } from "@/components/ui/heading.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";

// The `_todosLayout` segment is the id of the pathless layout route wrapping this child (see
// createTodosRoutes.tsx). Pathless ids become part of every descendant's route id even though they
// contribute nothing to the URL, so `createLazyRoute` must include it to match the real route id.
export const Route = createLazyRoute("/todos/_todosLayout/")({
    component: TodosList
});

const Link = createLink(IntentLink);

export function TodosList() {
    const todos = [
        { id: "1", title: "Buy milk" },
        { id: "2", title: "Walk the dog" }
    ];

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
