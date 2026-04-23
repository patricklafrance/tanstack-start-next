import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge.tsx";

const meta = {
    title: "Components/Badge",
    component: Badge
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

const render: Story["render"] = args => (
    <div className="flex flex-wrap items-center gap-3">
        <Badge {...args} isCircle={false}>
            Rounded
        </Badge>
        <Badge {...args} isCircle>
            Circle
        </Badge>
    </div>
);

export const Primary: Story = { args: { intent: "primary" }, render };
export const Secondary: Story = { args: { intent: "secondary" }, render };
export const Success: Story = { args: { intent: "success" }, render };
export const Warning: Story = { args: { intent: "warning" }, render };
export const Danger: Story = { args: { intent: "danger" }, render };
export const Info: Story = { args: { intent: "info" }, render };
export const Outline: Story = { args: { intent: "outline" }, render };
