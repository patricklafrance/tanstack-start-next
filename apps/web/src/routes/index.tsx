import { createFileRoute } from "@tanstack/react-router";
import { Text } from "@/components/ui/text.tsx";

function Home() {
    return <Text>You are on the home page!</Text>;
}

export const Route = createFileRoute("/")({
    component: Home
});
