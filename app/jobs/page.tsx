import { prisma } from "@/lib/prisma";
import JobsList from "./jobs-list";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
    const jobListings = await prisma.jobListing.findMany({
        orderBy: { createdAt: "desc" },
    });

    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Match jobs</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Requires a resume analyzed first. Match your resume against each listing.
                </p>
            </header>

            <JobsList jobListings={jobListings} />
        </main>
    );
}
