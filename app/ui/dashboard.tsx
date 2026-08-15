"use client";

import { useState } from "react";

type JobListing = {
    id: string;
    title: string;
    company: string;
    description: string;
    source: string;
    requiredJLPT: string | null;
    visaSponsorship: boolean | null;
    salary: string | null;
    location: string;
};

type ResumeResult = {
    resumeId: string;
    yearsOfExperience: number | null;
    educationLevel: string | null;
    skills: string[];
    jlptLevel: string | null;
};

type MatchResult = {
    matchId: string;
    matchScore: number;
    matchReasoning: string | null;
    visaEligible: boolean | null;
};

type InsightsResult = {
    insightId: string;
    insight: string;
    nextSteps: string[];
    estimatedTimeline: string | null;
};

type MatchState = {
    loading: boolean;
    error: string | null;
    result: MatchResult | null;
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

export default function Dashboard({ jobListings }: { jobListings: JobListing[] }) {
    const [userId, setUserId] = useState("test-user-001");

    const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
    const [resumeLoading, setResumeLoading] = useState(false);
    const [resumeError, setResumeError] = useState<string | null>(null);
    const [resumeResult, setResumeResult] = useState<ResumeResult | null>(null);

    const [matches, setMatches] = useState<Record<string, MatchState>>({});

    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState<string | null>(null);
    const [insightsResult, setInsightsResult] = useState<InsightsResult | null>(null);

    async function handleAnalyzeResume(e: React.FormEvent) {
        e.preventDefault();
        setResumeLoading(true);
        setResumeError(null);
        try {
            const res = await fetch("/api/resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, resumeText }),
            });
            if (!res.ok) throw new Error(await parseApiError(res));
            const { data } = await res.json();
            setResumeResult(data);
        } catch (err) {
            setResumeError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setResumeLoading(false);
        }
    }

    async function handleMatchJob(jobListingId: string) {
        setMatches((prev) => ({
            ...prev,
            [jobListingId]: { loading: true, error: null, result: null },
        }));
        try {
            const res = await fetch("/api/jobs/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, jobListingId }),
            });
            if (!res.ok) throw new Error(await parseApiError(res));
            const { data } = await res.json();
            setMatches((prev) => ({
                ...prev,
                [jobListingId]: { loading: false, error: null, result: data },
            }));
        } catch (err) {
            setMatches((prev) => ({
                ...prev,
                [jobListingId]: {
                    loading: false,
                    error: err instanceof Error ? err.message : "Unknown error",
                    result: null,
                },
            }));
        }
    }

    async function handleGenerateInsights() {
        setInsightsLoading(true);
        setInsightsError(null);
        try {
            const res = await fetch("/api/career/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (!res.ok) throw new Error(await parseApiError(res));
            const { data } = await res.json();
            setInsightsResult(data);
        } catch (err) {
            setInsightsError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setInsightsLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Japan Career Navigator</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Dev-build test harness wired against the live API — resume analysis, job matching, and career
                    insights.
                </p>
            </header>

            <section className="mb-8 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5">
                <label htmlFor="userId" className="block text-sm font-medium text-slate-300">
                    User ID
                </label>
                <input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="mt-2 w-full rounded-md border border-[var(--surface-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    placeholder="test-user-001"
                />
                <p className="mt-2 text-xs text-slate-500">
                    Every action below runs against this user. Seeded test data uses{" "}
                    <code className="rounded bg-black/30 px-1 py-0.5">test-user-001</code>.
                </p>
            </section>

            <section className="mb-8 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-medium">1. Analyze resume</h2>
                <p className="mt-1 text-sm text-slate-400">POST /api/resume</p>
                <form onSubmit={handleAnalyzeResume} className="mt-4 space-y-3">
                    <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={8}
                        className="w-full rounded-md border border-[var(--surface-border)] bg-black/20 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    />
                    <button
                        type="submit"
                        disabled={resumeLoading}
                        className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-strong)] disabled:opacity-50"
                    >
                        {resumeLoading ? "Analyzing…" : "Analyze resume"}
                    </button>
                </form>

                {resumeError && <p className="mt-3 text-sm text-red-400">{resumeError}</p>}

                {resumeResult && (
                    <div className="mt-4 rounded-md border border-[var(--surface-border)] bg-black/20 p-4 text-sm">
                        <dl className="grid grid-cols-2 gap-2">
                            <dt className="text-slate-400">Years of experience</dt>
                            <dd>{resumeResult.yearsOfExperience ?? "—"}</dd>
                            <dt className="text-slate-400">Education level</dt>
                            <dd>{resumeResult.educationLevel ?? "—"}</dd>
                            <dt className="text-slate-400">JLPT level</dt>
                            <dd>{resumeResult.jlptLevel ?? "—"}</dd>
                        </dl>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                            {resumeResult.skills.map((skill) => (
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

            <section className="mb-8 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-medium">2. Match jobs</h2>
                <p className="mt-1 text-sm text-slate-400">POST /api/jobs/match — requires resume analyzed above</p>

                <ul className="mt-4 space-y-3">
                    {jobListings.map((job) => {
                        const state = matches[job.id];
                        return (
                            <li
                                key={job.id}
                                className="rounded-md border border-[var(--surface-border)] bg-black/20 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium">{job.title}</p>
                                        <p className="text-sm text-slate-400">
                                            {job.company} · {job.location} · {job.source}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            JLPT: {job.requiredJLPT ?? "n/a"} · Visa sponsorship:{" "}
                                            {job.visaSponsorship ? "yes" : "no"} · {job.salary ?? "salary n/a"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleMatchJob(job.id)}
                                        disabled={state?.loading}
                                        className="shrink-0 rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-50"
                                    >
                                        {state?.loading ? "Matching…" : "Match"}
                                    </button>
                                </div>

                                {state?.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}

                                {state?.result && (
                                    <div className="mt-3 rounded-md bg-black/20 p-3 text-sm">
                                        <p className="font-medium">
                                            Match score: {state.result.matchScore}% · Visa eligible:{" "}
                                            {state.result.visaEligible ? "yes" : "no"}
                                        </p>
                                        {state.result.matchReasoning && (
                                            <p className="mt-1 text-slate-400">{state.result.matchReasoning}</p>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>

            <section className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5">
                <h2 className="text-lg font-medium">3. Generate career insights</h2>
                <p className="mt-1 text-sm text-slate-400">
                    POST /api/career/insights — requires at least one job matched above
                </p>
                <button
                    onClick={handleGenerateInsights}
                    disabled={insightsLoading}
                    className="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--accent-strong)] disabled:opacity-50"
                >
                    {insightsLoading ? "Generating…" : "Generate insights"}
                </button>

                {insightsError && <p className="mt-3 text-sm text-red-400">{insightsError}</p>}

                {insightsResult && (
                    <div className="mt-4 rounded-md border border-[var(--surface-border)] bg-black/20 p-4 text-sm">
                        <p>{insightsResult.insight}</p>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-300">
                            {insightsResult.nextSteps.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ul>
                        {insightsResult.estimatedTimeline && (
                            <p className="mt-3 text-slate-400">Estimated timeline: {insightsResult.estimatedTimeline}</p>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
