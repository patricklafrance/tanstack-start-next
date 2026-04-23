import { createLazyRoute, Outlet, useMatches, useRouter } from "@tanstack/react-router";
import type { Key } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs.tsx";

export const Route = createLazyRoute("/todos/_todosLayout")({
    component: TodosLayout
});

export function TodosLayout() {
    const matches = useMatches();
    const router = useRouter();

    const crumbs = matches
        .map(m => {
            const c = m.staticData?.crumb;
            const label = typeof c === "function" ? c(m) : c;
            return label ? { label, pathname: m.pathname } : null;
        })
        .filter((x): x is { label: string; pathname: string } => x !== null);

    const handleAction = (key: Key) => {
        router.navigate({ to: String(key) });
    };

    return (
        <div>
            <Breadcrumbs className="mb-6" onAction={handleAction}>
                {crumbs.map((c, i) => {
                    const isLast = i === crumbs.length - 1;
                    return (
                        <Breadcrumbs.Item key={c.pathname} id={c.pathname} href={!isLast ? c.pathname : undefined}>
                            {c.label}
                        </Breadcrumbs.Item>
                    );
                })}
            </Breadcrumbs>
            <Outlet />
        </div>
    );
}
