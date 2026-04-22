import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.tsx";

const meta = {
    title: "Components/Button/Success",
    component: Button,
    args: { intent: "success" }
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: args => (
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} size="xs">xs</Button>
            <Button {...args} size="sm">sm</Button>
            <Button {...args} size="md">md</Button>
            <Button {...args} size="lg">lg</Button>
        </div>
    )
};

export const Square: Story = {
    render: args => (
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} size="sq-xs">x</Button>
            <Button {...args} size="sq-sm">x</Button>
            <Button {...args} size="sq-md">x</Button>
            <Button {...args} size="sq-lg">x</Button>
        </div>
    )
};

export const Circle: Story = {
    render: args => (
        <div className="flex flex-wrap items-center gap-3">
            <Button {...args} size="sq-xs" isCircle>x</Button>
            <Button {...args} size="sq-sm" isCircle>x</Button>
            <Button {...args} size="sq-md" isCircle>x</Button>
            <Button {...args} size="sq-lg" isCircle>x</Button>
        </div>
    )
};
