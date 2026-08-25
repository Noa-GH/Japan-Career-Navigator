import { prisma } from "@/lib/prisma";
import Dashboard from "@/app/ui/dashboard";

export default async function Page() {
    const jobListings = await prisma.jobListing.findMany({
        orderBy: { createdAt: "asc" },
    });

    return (
        <Dashboard
            jobListings={jobListings.map((job) => ({
                id: job.id,
                title: job.title,
                company: job.company,
                description: job.description,
                source: job.source,
                requiredJLPT: job.requiredJLPT,
                visaSponsorship: job.visaSponsorship,
                salary: job.salary,
                location: job.location,
            }))}
        />
    );
}
