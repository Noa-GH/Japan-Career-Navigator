import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeResume } from "@/lib/resumeAnalyzer";
import { handleError, ValidationError } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeText, userId } = body;

        // Validation
        if (!resumeText || typeof resumeText !== "string") {
            throw new ValidationError("resumeText is required and must be a string");
        }

        if (!userId || typeof userId !== "string") {
            throw new ValidationError("userId is required and must be a string");
        }

        if (resumeText.trim().length < 50) {
            throw new ValidationError("Resume text must be at least 50 characters");
        }

        // Check user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new ValidationError("User not found", { userId });
        }

        // Analyze resume with Claude
        const analysisResult = await analyzeResume(resumeText);

        // Save to database
        const resume = await prisma.resume.upsert({
            where: { userId },
            update: {
                content: resumeText,
                yearsOfExperience: analysisResult.yearsOfExperience,
                educationLevel: analysisResult.educationLevel,
                skillTags: JSON.stringify(analysisResult.skills),
                jlptLevel: analysisResult.jlptLevel,
            },
            create: {
                userId,
                content: resumeText,
                yearsOfExperience: analysisResult.yearsOfExperience,
                educationLevel: analysisResult.educationLevel,
                skillTags: JSON.stringify(analysisResult.skills),
                jlptLevel: analysisResult.jlptLevel,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    resumeId: resume.id,
                    yearsOfExperience: resume.yearsOfExperience,
                    educationLevel: resume.educationLevel,
                    skills: JSON.stringify(resume.skillTags),
                    jlptLevel: resume.jlptLevel,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return handleError(error);
    }
}