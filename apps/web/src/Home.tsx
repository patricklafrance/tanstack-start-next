import { createRoute, type AnyRoute } from "@tanstack/react-router";

function Home() {
    return <p> You are on the home page!</p>;
}

export function createHomeRoute(parentRoute: AnyRoute) {
    return createRoute({
        getParentRoute: () => parentRoute,
        path: "/",
        component: Home
    });
}
