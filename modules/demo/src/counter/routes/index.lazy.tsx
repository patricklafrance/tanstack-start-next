import { createLazyRoute, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { updateCount } from "../Counter.server.ts";

export const Route = createLazyRoute("/counter/")({
    component: Counter
});

export function Counter() {
    const router = useRouter();
    const count = Route.useLoaderData();

    return (
        <Button
            type="button"
            onClick={async () => {
                await updateCount({ data: 1 });
                router.invalidate();
            }}
        >
            Add 1 to {count}?
        </Button>
    );
}
