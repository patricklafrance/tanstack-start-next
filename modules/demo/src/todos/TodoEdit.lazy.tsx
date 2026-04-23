import { createLazyRoute, createLink, useRouter } from "@tanstack/react-router";
import { Heading } from "@/components/ui/heading.tsx";
import { TextField } from "@/components/ui/text-field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";

export const Route = createLazyRoute("/todos/$todoId/edit")({
    component: TodoEdit
});

const Link = createLink(IntentLink);

export function TodoEdit() {
    const { todoId } = Route.useParams();
    const router = useRouter();

    return (
        <div>
            <Heading className="mb-4">Edit todo #{todoId}</Heading>
            <form
                className="max-w-md space-y-6"
                onSubmit={e => {
                    e.preventDefault();

                    router.navigate({ to: "/todos/$todoId", params: { todoId } });
                }}
            >
                <TextField name="title" defaultValue={`Todo ${todoId}`}>
                    <Label>Title</Label>
                    <Input />
                </TextField>
                <div className="flex gap-3">
                    <Button type="submit">Save</Button>
                    <Link to="/todos/$todoId" params={{ todoId }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
