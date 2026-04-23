import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "./breadcrumbs.tsx";

const meta = {
    title: "Components/Breadcrumbs",
    component: Breadcrumbs
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Breadcrumbs>
            <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#">Todos</Breadcrumbs.Item>
            <Breadcrumbs.Item>#1</Breadcrumbs.Item>
        </Breadcrumbs>
    )
};

export const SlashSeparator: Story = {
    render: () => (
        <Breadcrumbs separator="slash">
            <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#">Todos</Breadcrumbs.Item>
            <Breadcrumbs.Item>#1</Breadcrumbs.Item>
        </Breadcrumbs>
    )
};

export const TwoLevels: Story = {
    render: () => (
        <Breadcrumbs>
            <Breadcrumbs.Item href="#">Todos</Breadcrumbs.Item>
            <Breadcrumbs.Item>Edit</Breadcrumbs.Item>
        </Breadcrumbs>
    )
};

export const DeepChain: Story = {
    render: () => (
        <Breadcrumbs>
            <Breadcrumbs.Item href="#">Home</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#">Projects</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#">Acme</Breadcrumbs.Item>
            <Breadcrumbs.Item href="#">Todos</Breadcrumbs.Item>
            <Breadcrumbs.Item>#42</Breadcrumbs.Item>
        </Breadcrumbs>
    )
};
