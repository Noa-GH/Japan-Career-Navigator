"use client";

import { useState } from "react";

type InsightsResult = {
    insightId: string;
    insight: string;
    nextSteps: string[];
    estimatedTimeline: string | null;
};

type ApiErrorBody = {
    error?: { type?: string; message?: string; details?: unknown };
};

async function parseApiError(res: Response): Promise<string> {
    try {
        const body = (await res.json()) as ApiErrorBody;
        return body.error?.message ?? `Request failed (${res.status})`;
    } catch {
        return `Request failed (${res.status})`;
    }
}

export default function InsightsPanel() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<InsightsResult | null>(null);

    async function handleGenerateInsights() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/career/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error(await parseApiError(res));
            const { data } = await res.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5">
            <button
                onClick={handleGenerateInsights}
                disabled={loading}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-strong)] disabled:opacity-50"
            >
                {loading ? "Generating…" : "Generate insights"}
            </button>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            {result && (
                <div className="mt-4 rounded-md border border-[var(--surface-border)] bg-black/20 p-4 text-sm">
                    <p>{result.insight}</p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-300">
                        {result.nextSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                    {result.estimatedTimeline && (
                        <p className="mt-3 text-slate-400">Estimated timeline: {result.estimatedTimeline}</p>
                    )}
                </div>
            )}
        </section>
    );
}
