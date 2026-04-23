import { createFileRoute } from "@tanstack/react-router";
import { getCount } from "../Counter.server.ts";

export const Route = createFileRoute("/counter/")({
    loader: () => getCount()
});
