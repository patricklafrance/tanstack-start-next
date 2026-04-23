import { createFileRoute } from "@tanstack/react-router";
import { getCount } from "../Counter.server.ts";
import { Counter } from "../Counter.tsx";

export const Route = createFileRoute("/counter/")({
    loader: () => getCount(),
    component: Counter
});
