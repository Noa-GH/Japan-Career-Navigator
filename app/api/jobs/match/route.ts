import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleError, UnauthorizedError, ValidationError, NotFoundError } from "@/lib/errorHandler";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new UnauthorizedError();
        const userId = session.user.id;

        const body = await request.json();
        const { jobListingId } = body;

        // Validation
        if (!jobListingId || typeof jobListingId !== "string") {
            throw new ValidationError("jobListingId is required");
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

        // Fetch job listing
        const jobListing = await prisma.jobListing.findUnique({
            where: { id: jobListingId },
        });

        if (!jobListing) {
            throw new NotFoundError("JobListing");
        }

        // Parse skills array from JSON string
        const skills = JSON.parse(resume.skillTags);

        // Call Claude to match resume to job
        const client = new Anthropic();

        const matchingSchema = {
            type: "object",
            properties: {
                matchScore: {
                    type: "number",
                    description: "Match score from 0-100",
                },
                matchReasoning: {
                    type: "string",
                    description: "Explanation of why this is or isn't a good match",
                },
                visaEligible: {
                    type: "boolean",
                    description: "Whether the candidate is likely eligible for sponsorship",
                },
            },
            required: ["matchScore", "matchReasoning", "visaEligible"],
            additionalProperties: false,
        };

        const message = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: `Match this resume to this job posting and return ONLY the JSON object.

Resume:
Years of Experience: ${resume.yearsOfExperience}
Education Level: ${resume.educationLevel}
Skills: ${skills.join(", ")}
Japanese Level: ${resume.jlptLevel || "Not mentioned"}

Job Listing:
Title: ${jobListing.title}
Company: ${jobListing.company}
Description: ${jobListing.description}
Required JLPT: ${jobListing.requiredJLPT || "Not specified"}
Visa Sponsorship: ${jobListing.visaSponsorship ? "Yes" : "No"}

Analyze the match. Return matchScore (0-100), matchReasoning (brief), and visaEligible (true/false).`,
                },
            ],
            output_config: {
                format: {
                    type: "json_schema",
                    schema: matchingSchema,
                },
            } as any,
        });

        const textContent = message.content.find((block) => block.type === "text");
        if (!textContent || textContent.type !== "text") {
            throw new Error("No response from Claude");
        }

        const matchData = JSON.parse(textContent.text);

        // Store match in database
        const jobMatch = await prisma.jobMatch.upsert({
            where: {
                userId_jobListingId: {
                    userId,
                    jobListingId,
                },
            },
            update: {
                matchScore: matchData.matchScore,
                matchReasoning: matchData.matchReasoning,
                visaEligible: matchData.visaEligible,
            },
            create: {
                userId,
                jobListingId,
                matchScore: matchData.matchScore,
                matchReasoning: matchData.matchReasoning,
                visaEligible: matchData.visaEligible,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    matchId: jobMatch.id,
                    matchScore: jobMatch.matchScore,
                    matchReasoning: jobMatch.matchReasoning,
                    visaEligible: jobMatch.visaEligible,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error);
    }
}