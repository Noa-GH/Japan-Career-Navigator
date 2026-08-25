import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Nav from "./ui/nav";

export const metadata: Metadata = {
    title: "Japan Career Navigator",
    description: "AI-powered career navigation for professionals seeking opportunities in Japan's tech industry.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
                <Providers>
                    <Nav />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
