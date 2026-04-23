import { createLazyRoute, createLink } from "@tanstack/react-router";
import { Heading } from "@/components/ui/heading.tsx";
import { Text } from "@/components/ui/text.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";

// The `_todosLayout` segment is the id of the pathless layout route wrapping this child (see
// createTodosRoutes.tsx). Pathless ids become part of every descendant's route id even though they
// contribute nothing to the URL, so `createLazyRoute` must include it to match the real route id.
// Trailing slash: this is the index route under `$todoId`, which gives it an id ending in `/`.
export const Route = createLazyRoute("/todos/_todosLayout/$todoId/")({
    component: TodoDetail
});

const Link = createLink(IntentLink);

export function TodoDetail() {
    const { todoId } = Route.useParams();

    return (
        <div>
            <Heading className="mb-4">Todo #{todoId}</Heading>
            <Text className="mb-4">Details for todo {todoId} go here.</Text>
            <div className="flex gap-3">
                <Link to="/todos">← Back to list</Link>
                <Link to="/todos/$todoId/edit" params={{ todoId }}>
                    Edit
                </Link>
            </div>
        </div>
    );
}
