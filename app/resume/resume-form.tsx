"use client";

import { useState } from "react";

type ResumeResult = {
    resumeId: string;
    yearsOfExperience: number | null;
    educationLevel: string | null;
    skills: string[];
    jlptLevel: string | null;
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

const SAMPLE_RESUME = `Noah Test
Software Engineer

Experience:
5 years building full-stack web applications with React, TypeScript, and Node.js.
Led backend development for a fintech startup, working with PostgreSQL and REST APIs.

Education:
Bachelor's degree in Computer Science.

Languages:
Studying Japanese, currently JLPT N3 level.`;

export default function ResumeForm() {
    const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResumeResult | null>(null);

    async function handleAnalyzeResume(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resumeText }),
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
            <form onSubmit={handleAnalyzeResume} className="space-y-3">
                <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={12}
                    className="w-full rounded-md border border-[var(--surface-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-strong)] disabled:opacity-50"
                >
                    {loading ? "Analyzing…" : "Analyze resume"}
                </button>
            </form>

            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

            {result && (
                <div className="mt-4 rounded-md border border-[var(--surface-border)] bg-black/20 p-4 text-sm">
                    <dl className="grid grid-cols-2 gap-2">
                        <dt className="text-slate-400">Years of experience</dt>
                        <dd>{result.yearsOfExperience ?? "—"}</dd>
                        <dt className="text-slate-400">Education level</dt>
                        <dd>{result.educationLevel ?? "—"}</dd>
                        <dt className="text-slate-400">JLPT level</dt>
                        <dd>{result.jlptLevel ?? "—"}</dd>
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {result.skills.map((skill) => (
                            <span
                                key={skill}
                                className="rounded-full bg-[var(--accent)]/15 px-2.5 py-1 text-xs text-[var(--accent)]"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
