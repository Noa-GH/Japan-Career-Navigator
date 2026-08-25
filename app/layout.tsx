import type { Metadata } from "next";
import "./globals.css";

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
                {children}
            </body>
        </html>
    );
}
