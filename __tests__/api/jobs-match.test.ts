import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/mockPrisma";
import { buildRequest } from "../helpers/buildRequest";
import { mockAnthropicResponse } from "../helpers/mockAnthropic";

const mockMatchResponse = vi.hoisted(() => ({
    matchScore: 82,
    matchReasoning: "Strong overlap in required skills.",
    visaEligible: true,
}));

vi.mock("@anthropic-ai/sdk", () => ({
    default: mockAnthropicResponse(mockMatchResponse),
}));

import { POST } from "@/app/api/jobs/match/route";

const validBody = { userId: "user-1", jobListingId: "job-1" };

const baseResume = {
    id: "resume-1",
    userId: "user-1",
    content: "x".repeat(60),
    yearsOfExperience: 5,
    educationLevel: "Bachelor's",
    skillTags: JSON.stringify(["React", "Node.js"]),
    jlptLevel: "N3",
    createdAt: new Date(),
    updatedAt: new Date(),
};

const baseJobListing = {
    id: "job-1",
    title: "Full-Stack Developer",
    company: "TokyoDev Inc",
    description: "Looking for a full-stack developer.",
    url: "https://tokyodev.com/job1",
    source: "TokyoDev",
    requiredJLPT: "N3",
    visaSponsorship: true,
    salary: "¥4,500,000 - ¥6,000,000",
    location: "Tokyo, Japan",
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe("POST /api/jobs/match", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 when userId is missing", async () => {
        const res = await POST(buildRequest({ jobListingId: "job-1" }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when jobListingId is missing", async () => {
        const res = await POST(buildRequest({ userId: "user-1" }));
        expect(res.status).toBe(400);
    });

    it("returns 400 when the user has no resume", async () => {
        prismaMock.resume.findUnique.mockResolvedValue(null);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.message).toMatch(/no resume/i);
    });

    it("returns 404 when the job listing does not exist", async () => {
        prismaMock.resume.findUnique.mockResolvedValue(baseResume as any);
        prismaMock.jobListing.findUnique.mockResolvedValue(null);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error.type).toBe("NotFoundError");
    });

    it("scores the match and upserts on success", async () => {
        prismaMock.resume.findUnique.mockResolvedValue(baseResume as any);
        prismaMock.jobListing.findUnique.mockResolvedValue(baseJobListing as any);
        prismaMock.jobMatch.upsert.mockResolvedValue({
            id: "match-1",
            userId: "user-1",
            jobListingId: "job-1",
            matchScore: mockMatchResponse.matchScore,
            matchReasoning: mockMatchResponse.matchReasoning,
            visaEligible: mockMatchResponse.visaEligible,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toEqual({
            matchId: "match-1",
            matchScore: 82,
            matchReasoning: "Strong overlap in required skills.",
            visaEligible: true,
        });

        expect(prismaMock.jobMatch.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    userId_jobListingId: { userId: "user-1", jobListingId: "job-1" },
                },
            })
        );
    });
});
