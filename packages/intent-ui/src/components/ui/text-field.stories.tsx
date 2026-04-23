import type { Meta, StoryObj } from "@storybook/react-vite";
import { Description, FieldError, Label } from "./field.tsx";
import { Input } from "./input.tsx";
import { TextField } from "./text-field.tsx";

const meta = {
    title: "Components/TextField",
    component: TextField
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <TextField>
            <Label>Name</Label>
            <Input placeholder="Ada Lovelace" />
        </TextField>
    )
};

export const WithDescription: Story = {
    render: () => (
        <TextField>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" />
            <Description>We'll never share your email.</Description>
        </TextField>
    )
};

export const Required: Story = {
    render: () => (
        <TextField isRequired>
            <Label>Username</Label>
            <Input placeholder="Choose a username" />
        </TextField>
    )
};

export const Invalid: Story = {
    render: () => (
        <TextField isInvalid>
            <Label>Email</Label>
            <Input type="email" defaultValue="not-an-email" />
            <FieldError>Please enter a valid email address.</FieldError>
        </TextField>
    )
};

export const Disabled: Story = {
    render: () => (
        <TextField isDisabled>
            <Label>Disabled</Label>
            <Input defaultValue="Can't edit this" />
        </TextField>
    )
};
