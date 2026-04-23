import { createRoute, type AnyRoute } from "@tanstack/react-router";
import { Text } from "@/components/ui/text.tsx";

function Home() {
    return <Text>You are on the home page!</Text>;
}

export function createHomeRoute(parentRoute: AnyRoute) {
    return createRoute({
        getParentRoute: () => parentRoute,
        path: "/",
        component: Home
    });
}
