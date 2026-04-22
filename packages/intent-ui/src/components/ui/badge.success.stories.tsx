import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge.tsx";

const meta = {
    title: "Components/Badge/Success",
    component: Badge,
    args: { intent: "success" }
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: args => (
        <div className="flex flex-wrap items-center gap-3">
            <Badge {...args} isCircle={false}>Rounded</Badge>
            <Badge {...args} isCircle>Circle</Badge>
        </div>
    )
};
