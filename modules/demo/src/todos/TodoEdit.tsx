import { createLink, useLoaderData, useRouter } from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { Heading } from "@/components/ui/heading.tsx";
import { TextField } from "@/components/ui/text-field.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/field.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Link as IntentLink } from "@/components/ui/link.tsx";
import { updateTodo } from "./Todos.server.ts";

const Link = createLink(IntentLink);

export function TodoEdit() {
    const todo = useLoaderData({ from: "/todos/_todosLayout/$todoId/edit" });
    const router = useRouter();

    const form = useForm({
        defaultValues: {
            title: todo.title,
            description: todo.description ?? ""
        },
        onSubmit: async ({ value }) => {
            await updateTodo({
                data: {
                    id: todo.id,
                    title: value.title,
                    description: value.description || null,
                    completed: todo.completed
                }
            });

            await router.invalidate();
            router.navigate({ to: "/todos/$todoId", params: { todoId: todo.id } });
        }
    });

    return (
        <div>
            <Heading className="mb-4">Edit: {todo.title}</Heading>
            <form
                className="max-w-md space-y-6"
                onSubmit={e => {
                    e.preventDefault();
                    form.handleSubmit();
                }}
            >
                <form.Field name="title">
                    {field => (
                        <TextField name={field.name} value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur}>
                            <Label>Title</Label>
                            <Input />
                        </TextField>
                    )}
                </form.Field>
                <form.Field name="description">
                    {field => (
                        <TextField name={field.name} value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur}>
                            <Label>Description</Label>
                            <Input />
                        </TextField>
                    )}
                </form.Field>
                <div className="flex gap-3">
                    <Button type="submit">Save</Button>
                    <Link to="/todos/$todoId" params={{ todoId: todo.id }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
