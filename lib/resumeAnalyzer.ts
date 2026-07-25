import dotenv from "dotenv";
dotenv.config();
import Anthropic from "@anthropic-ai/sdk";

// Define the schema for what Claude will extract
const resumeSchema = {
    type: "object",
    properties: {
        yearsOfExperience: {
            type: "integer",
            description: "Total years of professional experience",
        },
        educationLevel: {
            type: "string",
            description: "Highest level of education (e.g., Bachelor's, Master's)",
        },
        skills: {
            type: "array",
            items: { type: "string" },
            description: "Array of technical and professional skills",
        },
        jlptLevel: {
            type: "string",
            description:
                "Japanese Language Proficiency Test level if mentioned (N1-N5, or null)",
        },
    },
    required: ["yearsOfExperience", "educationLevel", "skills", "jlptLevel"],
    additionalProperties: false,
};

interface ResumeAnalysisResult {
    yearsOfExperience: number;
    educationLevel: string;
    skills: string[];
    jlptLevel: string | null;
}

export async function analyzeResume(
    resumeText: string
): Promise<ResumeAnalysisResult> {
    const client = new Anthropic();

    const message = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [
            {
                role: "user",
                content: `Extract the following information from this resume and return ONLY the JSON object:
        
Resume:
${resumeText}

Extract:
- yearsOfExperience: total years of professional experience (number)
- educationLevel: highest education level (string)
- skills: array of technical/professional skills (array of strings)
- jlptLevel: Japanese language proficiency level if mentioned, otherwise null (string or null)`,
            },
        ],
        output_config: {
            format: {
                type: "json_schema",
                schema: resumeSchema,
            },
        } as any, // TypeScript SDK types might not be fully updated yet
    });

    // Extract the text response
    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
        throw new Error("No text response from Claude");
    }

    // Parse the JSON (it will be guaranteed valid due to structured outputs)
    const result = JSON.parse(textContent.text) as ResumeAnalysisResult;
    return result;
}