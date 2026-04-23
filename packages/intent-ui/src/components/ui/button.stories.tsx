import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.tsx";

const meta = {
    title: "Components/Button",
    component: Button
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

const render: Story["render"] = args => (
    <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} size="xs">
                xs
            </Button>
            <Button {...args} size="sm">
                sm
            </Button>
            <Button {...args} size="md">
                md
            </Button>
            <Button {...args} size="lg">
                lg
            </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} size="sq-xs">
                x
            </Button>
            <Button {...args} size="sq-sm">
                x
            </Button>
            <Button {...args} size="sq-md">
                x
            </Button>
            <Button {...args} size="sq-lg">
                x
            </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} size="sq-xs" isCircle>
                x
            </Button>
            <Button {...args} size="sq-sm" isCircle>
                x
            </Button>
            <Button {...args} size="sq-md" isCircle>
                x
            </Button>
            <Button {...args} size="sq-lg" isCircle>
                x
            </Button>
        </div>
    </div>
);

export const Primary: Story = { args: { intent: "primary" }, render };
export const Secondary: Story = { args: { intent: "secondary" }, render };
export const Success: Story = { args: { intent: "success" }, render };
export const Warning: Story = { args: { intent: "warning" }, render };
export const Danger: Story = { args: { intent: "danger" }, render };
export const Outline: Story = { args: { intent: "outline" }, render };
export const Plain: Story = { args: { intent: "plain" }, render };
