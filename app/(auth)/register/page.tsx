"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

type ApiErrorBody = {
    error?: { message?: string };
};

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: name || undefined, email, password }),
            });

            if (!res.ok) {
                const body = (await res.json()) as ApiErrorBody;
                throw new Error(body.error?.message ?? `Request failed (${res.status})`);
            }

            const result = await signIn("credentials", { email, password, redirect: false });
            if (result?.error) {
                throw new Error("Account created, but sign-in failed. Try signing in manually.");
            }

            router.push("/");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
            <p className="mt-1 text-sm text-slate-400">
                Get started with Japan Career Navigator.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded-md border border-[var(--surface-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    <p className="mt-1 text-xs text-slate-500">At least 8 characters.</p>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-strong)] disabled:opacity-50"
                >
                    {loading ? "Creating account…" : "Create account"}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--accent)] hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
