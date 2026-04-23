import type { Meta, StoryObj } from "@storybook/react-vite";
import { Description, FieldError, FieldGroup, Fieldset, Label, Legend } from "./field.tsx";
import { Input } from "./input.tsx";
import { TextField } from "./text-field.tsx";

const meta = {
    title: "Components/Field"
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LabelOnly: Story = {
    render: () => <Label>Email address</Label>
};

export const DescriptionOnly: Story = {
    render: () => <Description>This helper text explains the field.</Description>
};

export const FieldErrorOnly: Story = {
    render: () => (
        <TextField isInvalid>
            <FieldError>This field is required.</FieldError>
        </TextField>
    )
};

export const LabelWithDescription: Story = {
    render: () => (
        <TextField>
            <Label>Email</Label>
            <Input type="email" placeholder="you@example.com" />
            <Description>We'll never share your email.</Description>
        </TextField>
    )
};

export const FieldsetWithLegend: Story = {
    render: () => (
        <Fieldset>
            <Legend>Contact information</Legend>
            <Description>How can we reach you?</Description>
            <FieldGroup>
                <TextField>
                    <Label>Full name</Label>
                    <Input placeholder="Ada Lovelace" />
                </TextField>
                <TextField>
                    <Label>Email</Label>
                    <Input type="email" placeholder="you@example.com" />
                </TextField>
                <TextField>
                    <Label>Phone</Label>
                    <Input type="tel" placeholder="555-555-5555" />
                </TextField>
            </FieldGroup>
        </Fieldset>
    )
};
