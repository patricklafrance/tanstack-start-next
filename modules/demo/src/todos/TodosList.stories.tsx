import type { Meta, StoryObj } from "@storybook/react-vite";
// Imported from storybook-addon-tanstack-router rather than the "start" package's root barrel, because that barrel
// transitively imports the Vite plugin — whose module top-level calls fileURLToPath(import.meta.url) — and would
// crash the browser bundle. The "start" addon re-exports this function from the "router" addon anyway.
import { tanstackRouterParameters } from "storybook-addon-tanstack-router";
import { TodosList } from "./TodosList.tsx";

const meta = {
    title: "Demo/Todos/TodosList",
    component: TodosList
} satisfies Meta<typeof TodosList>;

export default meta;
type Story = StoryObj<typeof meta>;

const sample = [
    {
        id: "t-buy-milk",
        title: "Buy milk",
        description: "2% organic",
        completed: false,
        createdAt: new Date("2026-04-01T10:00:00Z"),
        updatedAt: new Date("2026-04-01T10:00:00Z")
    },
    {
        id: "t-walk-dog",
        title: "Walk the dog",
        description: null,
        completed: true,
        createdAt: new Date("2026-04-02T11:00:00Z"),
        updatedAt: new Date("2026-04-02T11:00:00Z")
    },
    {
        id: "t-finish-poc",
        title: "Finish POC",
        description: "Route docs + breadcrumb tests",
        completed: false,
        createdAt: new Date("2026-04-03T09:00:00Z"),
        updatedAt: new Date("2026-04-03T09:00:00Z")
    }
];

// `path` must be the full route id (including `_todosLayout` and the trailing slash), because the addon
// builds a two-node mock tree (root + storyRoute) and `useLoaderData({ from })` in the component matches
// against that route's id. Any path shorter than the component's `from` string yields
// "Could not find an active match".
export const Several: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location: { path: "/todos/_todosLayout/" },
            loader: { data: sample }
        })
    }
};

export const Empty: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location: { path: "/todos/_todosLayout/" },
            loader: { data: [] }
        })
    }
};
