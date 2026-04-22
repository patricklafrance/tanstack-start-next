/// <reference types="vite/client" />

import styles from "../styles.css?url";
import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { RootLayout } from "../RootLayout.tsx";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            {
                charSet: "utf-8"
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1"
            },
            {
                title: "TanStack Start Starter"
            }
        ],
        links: [
            {
                rel: "stylesheet",
                href: styles
            }
        ]
    }),
    component: RootComponent
});

function RootComponent() {
    return (
        <RootDocument>
            <RootLayout>
                <Outlet />
            </RootLayout>
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
                <TanStackRouterDevtools />
            </body>
        </html>
    );
}
