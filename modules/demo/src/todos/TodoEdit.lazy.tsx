import { createLazyRoute, Link, useRouter } from "@tanstack/react-router";

export const Route = createLazyRoute("/todos/$todoId/edit")({
    component: TodoEdit
});

export function TodoEdit() {
    const { todoId } = Route.useParams();
    const router = useRouter();

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Edit todo #{todoId}</h1>
            <form
                className="max-w-md space-y-3"
                onSubmit={e => {
                    e.preventDefault();

                    router.navigate({ to: "/todos/$todoId", params: { todoId } });
                }}
            >
                <label className="block">
                    <span className="mb-1 block">Title</span>
                    <input type="text" defaultValue={`Todo ${todoId}`} className="w-full rounded border px-2 py-1" />
                </label>
                <div className="flex gap-3">
                    <button type="submit" className="rounded border px-3 py-1">
                        Save
                    </button>
                    <Link to="/todos/$todoId" params={{ todoId }} className="underline">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
