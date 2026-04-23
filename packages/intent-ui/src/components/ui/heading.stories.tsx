import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./heading.tsx";

const meta = {
    title: "Components/Heading",
    component: Heading
} satisfies Meta<typeof Heading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllLevels: Story = {
    render: () => (
        <div className="flex flex-col gap-3">
            <Heading level={1}>Heading level 1</Heading>
            <Heading level={2}>Heading level 2</Heading>
            <Heading level={3}>Heading level 3</Heading>
            <Heading level={4}>Heading level 4</Heading>
        </div>
    )
};

export const Level1: Story = { args: { level: 1, children: "Heading level 1" } };
export const Level2: Story = { args: { level: 2, children: "Heading level 2" } };
export const Level3: Story = { args: { level: 3, children: "Heading level 3" } };
export const Level4: Story = { args: { level: 4, children: "Heading level 4" } };
