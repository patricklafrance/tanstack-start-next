import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../db/client.ts";

export const getTodos = createServerFn({ method: "GET" }).handler(() => {
    return prisma.todo.findMany({
        orderBy: { createdAt: "asc" }
    });
});

export type TodosLoaderData = Awaited<ReturnType<typeof getTodos>>;
