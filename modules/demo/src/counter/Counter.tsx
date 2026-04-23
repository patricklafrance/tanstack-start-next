import { useLoaderData, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button.tsx";
import { updateCount } from "./Counter.server.ts";

export function Counter() {
    const router = useRouter();
    const count = useLoaderData({ from: "/counter/" });

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
