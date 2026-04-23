import { createLazyRoute, createLink, useLoaderData } from "@tanstack/react-router";
import { Heading } from "@/components/ui/heading.tsx";
import { Text } from "@/components/ui/text.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";

export const Route = createLazyRoute("/todos/_todosLayout/$todoId/")({
    component: TodoDetail
});

const Link = createLink(IntentLink);

export function TodoDetail() {
    const todo = useLoaderData({ from: "/todos/_todosLayout/$todoId" });

    return (
        <div>
            <Heading className="mb-4">{todo.title}</Heading>
            {todo.description && <Text className="mb-2">{todo.description}</Text>}
            <Text className="mb-4">Status: {todo.completed ? "Done" : "Not done"}</Text>
            <div className="flex gap-3">
                <Link to="/todos">← Back to list</Link>
                <Link to="/todos/$todoId/edit" params={{ todoId: todo.id }}>
                    Edit
                </Link>
            </div>
        </div>
    );
}
