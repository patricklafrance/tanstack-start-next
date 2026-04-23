import type { ReactNode } from "react";
import { Link as IntentLink } from "@/components/ui/link.tsx";
import { createLink } from "@tanstack/react-router";

const Link = createLink(IntentLink);

interface RootLayoutProps {
    children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            <nav className="flex gap-4 border-b px-6 py-3">
                <Link to="/">Home</Link>
                <Link to="/counter">Counter</Link>
                <Link to="/todos">Todos</Link>
            </nav>
            <main className="p-6">{children}</main>
        </>
    );
}
