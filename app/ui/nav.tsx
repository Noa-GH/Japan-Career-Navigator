"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const LINKS = [
    { href: "/", label: "Home" },
    { href: "/resume", label: "Resume" },
    { href: "/jobs", label: "Jobs" },
    { href: "/insights", label: "Insights" },
    { href: "/profile", label: "Profile" },
];

export default function Nav() {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (status !== "authenticated") {
        return null;
    }

    return (
        <nav className="border-b border-[var(--surface-border)] bg-[var(--surface)]">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-1">
                    {LINKS.map((link) => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                    active
                                        ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                                        : "text-slate-300 hover:bg-black/20"
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                    <span>{session?.user?.email}</span>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="rounded-md border border-[var(--surface-border)] px-3 py-1.5 text-slate-300 hover:bg-black/20"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
}
