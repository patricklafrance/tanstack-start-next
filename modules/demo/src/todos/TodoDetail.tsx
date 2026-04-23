import { createServerFn } from "@tanstack/react-start";
import { prisma } from "../db/client.ts";

export const getTodoById = createServerFn({ method: "GET" })
    .inputValidator((todoId: string) => todoId)
    .handler(({ data }) => {
        return prisma.todo.findUniqueOrThrow({
            where: { id: data }
        });
    });

export type TodoByIdLoaderData = Awaited<ReturnType<typeof getTodoById>>;
