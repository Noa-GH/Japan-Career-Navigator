import Link from "next/link";
import { auth } from "@/lib/auth";

const FEATURES = [
    { href: "/resume", title: "Analyze resume", description: "Extract experience, education, skills, and JLPT level." },
    { href: "/jobs", title: "Match jobs", description: "Compare your resume against Japan-focused job listings." },
    { href: "/insights", title: "Career insights", description: "Get a personalized career pathway and next steps." },
];

export default async function HomePage() {
    const session = await auth();

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                    Navigate your career in Japan&apos;s tech industry with AI-powered guidance.
                </p>
            </header>

            <div className="grid gap-4 sm:grid-cols-3">
                {FEATURES.map((feature) => (
                    <Link
                        key={feature.href}
                        href={feature.href}
                        className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]"
                    >
                        <h2 className="text-lg font-medium">{feature.title}</h2>
                        <p className="mt-1 text-sm text-slate-400">{feature.description}</p>
                    </Link>
                ))}
            </div>
        </main>
    );
}
