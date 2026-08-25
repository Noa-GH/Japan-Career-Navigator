import { prisma } from "@/lib/prisma";

async function main() {
    console.log("🌱 Seeding database...\n");

    // Clear existing data (idempotent — safe to run multiple times)
    await prisma.careerInsight.deleteMany();
    await prisma.jobMatch.deleteMany();
    await prisma.jobInsight.deleteMany();
    await prisma.resume.deleteMany();
    await prisma.jobListing.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const user = await prisma.user.create({
        data: {
            id: "test-user-001",
            email: "noah@example.com",
            name: "Noah Test",
        },
    });
    console.log("✅ Created user:", user.email);

    // Create sample job listings
    const job1 = await prisma.jobListing.create({
        data: {
            title: "Full-Stack Developer",
            company: "TokyoDev Inc",
            description:
                "Looking for a full-stack developer with React and Node.js experience. Experience with Japanese language a plus.",
            url: "https://tokyodev.com/job1",
            source: "TokyoDev",
            requiredJLPT: "N3",
            visaSponsorship: true,
            salary: "¥4,500,000 - ¥6,000,000",
            location: "Tokyo, Japan",
        },
    });
    console.log("✅ Created job:", job1.title);

    const job2 = await prisma.jobListing.create({
        data: {
            title: "Frontend Engineer",
            company: "JapanDev Ltd",
            description:
                "Frontend-focused role building React applications for Japanese market. Need TypeScript proficiency.",
            url: "https://japandev.com/job2",
            source: "JapanDev",
            requiredJLPT: "N2",
            visaSponsorship: true,
            salary: "¥5,000,000 - ¥7,000,000",
            location: "Osaka, Japan",
        },
    });
    console.log("✅ Created job:", job2.title);

    const job3 = await prisma.jobListing.create({
        data: {
            title: "Backend Developer",
            company: "Tokyo Tech",
            description:
                "Backend API development with Node.js and PostgreSQL. Remote-friendly. English-speaking team.",
            url: "https://tokyotech.com/job3",
            source: "TokyoDev",
            requiredJLPT: null,
            visaSponsorship: false,
            salary: "¥4,000,000 - ¥5,500,000",
            location: "Remote",
        },
    });
    console.log("✅ Created job:", job3.title);

    console.log(
        "\n✨ Seeding complete! Ready for Postman testing.\n"
    );
    console.log("Test user ID:", user.id);
    console.log("Test user email:", user.email);
    console.log("Job 1 ID:", job1.id);
    console.log("Job 2 ID:", job2.id);
    console.log("Job 3 ID:", job3.id);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });