import { createLazyRoute, createLink } from "@tanstack/react-router";
import { Heading } from "@/components/ui/heading.tsx";
import { Text } from "@/components/ui/text.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";

export const Route = createLazyRoute("/todos/$todoId")({
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
