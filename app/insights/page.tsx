import InsightsPanel from "./insights-panel";

export default function InsightsPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Career insights</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Requires at least one job matched. Generates a personalized career pathway.
                </p>
            </header>

            <InsightsPanel />
        </main>
    );
}
