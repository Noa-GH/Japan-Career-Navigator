import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleError, UnauthorizedError, ValidationError } from "@/lib/errorHandler";
import Anthropic from "@anthropic-ai/sdk";

export async function POST() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new UnauthorizedError();
        const userId = session.user.id;

        // Fetch user's resume
        const resume = await prisma.resume.findUnique({
            where: { userId },
        });

        if (!resume) {
            throw new ValidationError(
                "User has no resume. Please analyze a resume first."
            );
        }

        // Fetch all job matches for this user
        const jobMatches = await prisma.jobMatch.findMany({
            where: { userId },
            include: { jobListing: true },
        });

        if (jobMatches.length === 0) {
            throw new ValidationError(
                "No job matches found. Please match some jobs first."
            );
        }

        // Prepare job summary for Claude
        const jobSummary = jobMatches
            .map(
                (match) =>
                    `- ${match.jobListing.title} at ${match.jobListing.company} (Match: ${match.matchScore}%)`
            )
            .join("\n");

        // Call Claude to generate insights
        const client = new Anthropic();

        const insightsSchema = {
            type: "object",
            properties: {
                insight: {
                    type: "string",
                    description: "Overall career pathway recommendation",
                },
                nextSteps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable next steps",
                },
                estimatedTimeline: {
                    type: "string",
                    description: "Estimated timeline to achieve goals",
                },
            },
            required: ["insight", "nextSteps", "estimatedTimeline"],
            additionalProperties: false,
        };

        const message = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `Generate career insights for this user based on their resume and job matches. Return ONLY the JSON object.

Resume Profile:
Years of Experience: ${resume.yearsOfExperience}
Education: ${resume.educationLevel}
Skills: ${JSON.parse(resume.skillTags).join(", ")}
Japanese Level: ${resume.jlptLevel || "Not mentioned"}

Matched Jobs:
${jobSummary}

Provide: insight (brief career pathway), nextSteps (array of 3-5 actions), estimatedTimeline (how long to achieve).`,
                },
            ],
            output_config: {
                format: {
                    type: "json_schema",
                    schema: insightsSchema,
                },
            } as any,
        });

        const textContent = message.content.find((block) => block.type === "text");
        if (!textContent || textContent.type !== "text") {
            throw new Error("No response from Claude");
        }

        const insightData = JSON.parse(textContent.text);

        // Store insights in database (stringify the nextSteps array)
        const careerInsight = await prisma.careerInsight.create({
            data: {
                userId,
                insight: insightData.insight,
                nextSteps: JSON.stringify(insightData.nextSteps), // Convert array to JSON string
                estimatedTimeline: insightData.estimatedTimeline,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    insightId: careerInsight.id,
                    insight: careerInsight.insight,
                    nextSteps: JSON.parse(careerInsight.nextSteps), // Parse back to array
                    estimatedTimeline: careerInsight.estimatedTimeline,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error);
    }
}