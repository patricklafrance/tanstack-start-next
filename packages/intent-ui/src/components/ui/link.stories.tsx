import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./link.tsx";

const meta = {
    title: "Components/Link",
    component: Link
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { href: "#", children: "Visit the docs" }
};

export const Disabled: Story = {
    args: { href: "#", isDisabled: true, children: "Disabled link" }
};

export const WithoutHref: Story = {
    args: { children: "Acts as a button", onPress: () => alert("pressed") }
};
