import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Strong, Text, TextLink } from "./text.tsx";

const meta = {
    title: "Components/Text",
    component: Text
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Paragraph: Story = {
    args: { children: "The quick brown fox jumps over the lazy dog." }
};

export const WithStrong: Story = {
    render: () => (
        <Text>
            This is a paragraph containing a <Strong>strong emphasis</Strong> segment.
        </Text>
    )
};

export const WithCode: Story = {
    render: () => (
        <Text>
            Install via <Code>pnpm add @packages/intent-ui</Code> to get started.
        </Text>
    )
};

export const WithTextLink: Story = {
    render: () => (
        <Text>
            Read more in the <TextLink href="#">documentation</TextLink> for details.
        </Text>
    )
};

export const Combined: Story = {
    render: () => (
        <Text>
            Call <Code>cx()</Code> to merge classes. See the <TextLink href="#">primitive helpers</TextLink> — <Strong>not</Strong> the legacy export.
        </Text>
    )
};
