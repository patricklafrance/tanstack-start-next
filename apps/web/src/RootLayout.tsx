import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

interface RootLayoutProps {
    children: ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            <nav className="flex gap-4 border-b px-6 py-3">
                <Link to="/" className="font-medium hover:underline" activeProps={{ className: "underline" }} activeOptions={{ exact: true }}>
                    Home
                </Link>
                <Link to="/counter" className="font-medium hover:underline" activeProps={{ className: "underline" }}>
                    Counter
                </Link>
                <Link to="/todos" className="font-medium hover:underline" activeProps={{ className: "underline" }}>
                    Todos
                </Link>
            </nav>
            <main className="p-6">{children}</main>
        </>
    );
}
