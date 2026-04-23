import type { Meta, StoryObj } from "@storybook/react-vite";
// Imported from storybook-addon-tanstack-router rather than the "start" package's root barrel, because that barrel
// transitively imports the Vite plugin — whose module top-level calls fileURLToPath(import.meta.url) — and would
// crash the browser bundle. The "start" addon re-exports this function from the "router" addon anyway.
import { tanstackRouterParameters } from "storybook-addon-tanstack-router";
import { TodoDetail } from "./TodoDetail.tsx";

const meta = {
    title: "Demo/Todos/TodoDetail",
    component: TodoDetail
} satisfies Meta<typeof TodoDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseTodo = {
    id: "t-buy-milk",
    title: "Buy milk",
    description: "2% organic" as string | null,
    completed: false,
    createdAt: new Date("2026-04-01T10:00:00Z"),
    updatedAt: new Date("2026-04-01T10:00:00Z")
};

// `path` must be the full route id (including `_todosLayout` and the trailing slash), because the addon
// builds a two-node mock tree (root + storyRoute) and `useLoaderData({ from })` in the component matches
// against that route's id. Any path shorter than the component's `from` string yields
// "Could not find an active match".
const location = { path: "/todos/_todosLayout/$todoId/", params: { todoId: "t-buy-milk" } };

export const Incomplete: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location,
            loader: { data: baseTodo }
        })
    }
};

export const Completed: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location,
            loader: { data: { ...baseTodo, completed: true } }
        })
    }
};

export const NoDescription: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location,
            loader: { data: { ...baseTodo, description: null } }
        })
    }
};
