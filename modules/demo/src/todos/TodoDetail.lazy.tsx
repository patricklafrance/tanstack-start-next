import { createLazyRoute, Link } from "@tanstack/react-router";

export const Route = createLazyRoute("/todos/$todoId")({
    component: TodoDetail
});

export function TodoDetail() {
    const { todoId } = Route.useParams();

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Todo #{todoId}</h1>
            <p className="mb-4">Details for todo {todoId} go here.</p>
            <div className="flex gap-3">
                <Link to="/todos" className="underline">
                    ← Back to list
                </Link>
                <Link to="/todos/$todoId/edit" params={{ todoId }} className="underline">
                    Edit
                </Link>
            </div>
        </div>
    );
}
