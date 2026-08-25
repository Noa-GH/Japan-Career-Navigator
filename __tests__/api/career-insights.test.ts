import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/mockPrisma";
import { mockSession } from "../helpers/mockAuth";
import { mockAnthropicResponse } from "../helpers/mockAnthropic";

const mockInsightResponse = vi.hoisted(() => ({
    insight: "Pursue mid-level full-stack roles with visa sponsorship.",
    nextSteps: ["Improve JLPT to N2", "Build a Japanese portfolio site"],
    estimatedTimeline: "6-12 months",
}));

vi.mock("@anthropic-ai/sdk", () => ({
    default: mockAnthropicResponse(mockInsightResponse),
}));

import { POST } from "@/app/api/career/insights/route";

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

const baseJobMatch = {
    id: "match-1",
    userId: "user-1",
    jobListingId: "job-1",
    matchScore: 82,
    matchReasoning: "Strong overlap",
    visaEligible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    jobListing: {
        id: "job-1",
        title: "Full-Stack Developer",
        company: "TokyoDev Inc",
        description: "desc",
        url: "https://tokyodev.com/job1",
        source: "TokyoDev",
        requiredJLPT: "N3",
        visaSponsorship: true,
        salary: "¥4,500,000",
        location: "Tokyo, Japan",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
};

describe("POST /api/career/insights", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSession("user-1");
    });

    it("returns 401 when unauthenticated", async () => {
        mockSession(null);

        const res = await POST();
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error.type).toBe("UnauthorizedError");
    });

    it("returns 400 when the user has no resume", async () => {
        prismaMock.resume.findUnique.mockResolvedValue(null);

        const res = await POST();
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.message).toMatch(/no resume/i);
    });

    it("returns 400 when the user has no job matches", async () => {
        prismaMock.resume.findUnique.mockResolvedValue(baseResume as any);
        prismaMock.jobMatch.findMany.mockResolvedValue([]);

        const res = await POST();
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.message).toMatch(/no job matches/i);
    });

    it("generates insights and returns 200 with nextSteps parsed as an array", async () => {
        prismaMock.resume.findUnique.mockResolvedValue(baseResume as any);
        prismaMock.jobMatch.findMany.mockResolvedValue([baseJobMatch] as any);
        prismaMock.careerInsight.create.mockResolvedValue({
            id: "insight-1",
            userId: "user-1",
            insight: mockInsightResponse.insight,
            nextSteps: JSON.stringify(mockInsightResponse.nextSteps),
            estimatedTimeline: mockInsightResponse.estimatedTimeline,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        const res = await POST();
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.insightId).toBe("insight-1");
        expect(json.data.insight).toBe(mockInsightResponse.insight);
        expect(json.data.nextSteps).toEqual(mockInsightResponse.nextSteps);
        expect(json.data.estimatedTimeline).toBe("6-12 months");
    });
});
