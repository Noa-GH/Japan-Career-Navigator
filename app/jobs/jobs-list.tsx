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

type MatchResult = {
    matchId: string;
    matchScore: number;
    matchReasoning: string | null;
    visaEligible: boolean | null;
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

export default function JobsList({ jobListings }: { jobListings: JobListing[] }) {
    const [matches, setMatches] = useState<Record<string, MatchState>>({});

    async function handleMatchJob(jobListingId: string) {
        setMatches((prev) => ({
            ...prev,
            [jobListingId]: { loading: true, error: null, result: null },
        }));
        try {
            const res = await fetch("/api/jobs/match", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jobListingId }),
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

    return (
        <ul className="space-y-3">
            {jobListings.map((job) => {
                const state = matches[job.id];
                return (
                    <li
                        key={job.id}
                        className="rounded-md border border-[var(--surface-border)] bg-[var(--surface)] p-4"
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
    );
}
