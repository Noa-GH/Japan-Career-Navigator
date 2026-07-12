import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError } from "@/lib/errorHandler";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;

        // Validation
        if (!userId || typeof userId !== "string") {
            throw new ValidationError("userId is required");
        }

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
Skills: ${resume.skillTags.join(", ")}
Japanese Level: ${resume.jlptLevel || "Not mentioned"}

Matched Jobs:
${jobSummary}

Provide: insight (brief career pathway), nextSteps (array of 3-5 actions), estimatedTimeline (how long to achieve).`,
                },
            ],
            output_config: {
                type: "json_schema",
                schema: insightsSchema,
            } as any,
        });

        const textContent = message.content.find((block) => block.type === "text");
        if (!textContent || textContent.type !== "text") {
            throw new Error("No response from Claude");
        }

        const insightData = JSON.parse(textContent.text);

        // Store insights in database
        const careerInsight = await prisma.careerInsight.create({
            data: {
                userId,
                insight: insightData.insight,
                nextSteps: insightData.nextSteps,
                estimatedTimeline: insightData.estimatedTimeline,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    insightId: careerInsight.id,
                    insight: careerInsight.insight,
                    nextSteps: careerInsight.nextSteps,
                    estimatedTimeline: careerInsight.estimatedTimeline,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error);
    }
}