import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../db/client.ts";

export const getTodos = createServerFn({ method: "GET" }).handler(() => {
    return prisma.todo.findMany({
        orderBy: { createdAt: "asc" }
    });
});

export const getTodoById = createServerFn({ method: "GET" })
    .inputValidator((todoId: string) => todoId)
    .handler(({ data }) => {
        return prisma.todo.findUniqueOrThrow({
            where: { id: data }
        });
    });

export const updateTodo = createServerFn({ method: "POST" })
    .inputValidator((d: { id: string; title: string; description: string | null; completed: boolean }) => d)
    .handler(async ({ data }) => {
        await prisma.todo.update({
            where: { id: data.id },
            data: {
                title: data.title,
                description: data.description,
                completed: data.completed
            }
        });
    });
