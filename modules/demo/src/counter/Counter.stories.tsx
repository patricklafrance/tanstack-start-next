import type { Meta, StoryObj } from "@storybook/react-vite";
// Imported from storybook-addon-tanstack-router rather than the "start" package's root barrel, because that barrel
// transitively imports the Vite plugin — whose module top-level calls fileURLToPath(import.meta.url) — and would
// crash the browser bundle. The "start" addon re-exports this function from the "router" addon anyway.
import { tanstackRouterParameters } from "storybook-addon-tanstack-router";
import { Counter } from "./Counter.tsx";

const meta = {
    title: "Demo/Counter",
    component: Counter
} satisfies Meta<typeof Counter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Zero: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location: { path: "/counter/" },
            loader: { data: 0 }
        })
    }
};

export const MidCount: Story = {
    parameters: {
        tanstackRouter: tanstackRouterParameters({
            location: { path: "/counter/" },
            loader: { data: 41 }
        })
    }
};
