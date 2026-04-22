import * as fs from "node:fs";
import { createLazyRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button.tsx";

const filePath = "count.txt";

const updateCount = createServerFn({ method: "POST" })
    .inputValidator((d: number) => d)
    .handler(async ({ data }) => {
        const count = parseInt(await fs.promises.readFile(filePath, "utf-8").catch(() => "0"));
        await fs.promises.writeFile(filePath, `${count + data}`);
    });

export const Route = createLazyRoute("/counter")({
    component: CounterRoute
});

function CounterRoute() {
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
