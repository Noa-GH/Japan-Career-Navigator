"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiErrorBody = {
    error?: { message?: string };
};

export default function ProfileForm({
    initialName,
    initialEmail,
}: {
    initialName: string;
    initialEmail: string;
}) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSaved(false);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) {
                const body = (await res.json()) as ApiErrorBody;
                throw new Error(body.error?.message ?? `Request failed (${res.status})`);
            }

            setSaved(true);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5"
        >
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                    Name
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--surface-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-[var(--surface-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {saved && !error && <p className="text-sm text-[var(--accent)]">Saved.</p>}

            <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-strong)] disabled:opacity-50"
            >
                {loading ? "Saving…" : "Save changes"}
            </button>
        </form>
    );
}
