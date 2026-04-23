import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "react-aria-components/TextField";
import { Description, Label } from "./field.tsx";
import { Input, InputGroup } from "./input.tsx";

const meta = {
    title: "Components/Input",
    component: Input
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { placeholder: "Type here..." }
};

export const Disabled: Story = {
    args: { placeholder: "Disabled", disabled: true }
};

export const Invalid: Story = {
    render: () => (
        <TextField isInvalid>
            <Label>Email</Label>
            <Input type="email" defaultValue="not-an-email" />
            <Description>Enter a valid email address.</Description>
        </TextField>
    )
};

export const Group: Story = {
    render: () => (
        <InputGroup>
            <span data-slot="text">https://</span>
            <Input placeholder="example.com" />
        </InputGroup>
    )
};
