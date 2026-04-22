import { createLazyRoute, Link } from "@tanstack/react-router";

export const Route = createLazyRoute("/todos/")({
    component: TodosList
});

export function TodosList() {
    const todos = [
        { id: "1", title: "Buy milk" },
        { id: "2", title: "Walk the dog" }
    ];

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Todos</h1>
            <ul className="space-y-2">
                {todos.map(t => (
                    <li key={t.id}>
                        <Link to="/todos/$todoId" params={{ todoId: t.id }} className="underline">
                            {t.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
