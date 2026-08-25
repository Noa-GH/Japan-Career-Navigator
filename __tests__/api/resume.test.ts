import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/mockPrisma";
import { mockSession } from "../helpers/mockAuth";
import { buildRequest } from "../helpers/buildRequest";

vi.mock("@/lib/resumeAnalyzer", () => ({
    analyzeResume: vi.fn(),
}));

import { POST } from "@/app/api/resume/route";
import { analyzeResume } from "@/lib/resumeAnalyzer";

const validBody = {
    resumeText: "x".repeat(60),
};

describe("POST /api/resume", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSession("user-1");
    });

    it("returns 401 when unauthenticated", async () => {
        mockSession(null);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(401);
        const json = await res.json();
        expect(json.error.type).toBe("UnauthorizedError");
    });

    it("returns 400 when resumeText is missing", async () => {
        const res = await POST(buildRequest({}));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.type).toBe("ValidationError");
    });

    it("returns 400 when resumeText is under 50 characters", async () => {
        const res = await POST(buildRequest({ resumeText: "too short" }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.message).toMatch(/at least 50 characters/i);
    });

    it("analyzes, upserts, and returns 200 with parsed skills on success", async () => {
        vi.mocked(analyzeResume).mockResolvedValue({
            yearsOfExperience: 5,
            educationLevel: "Bachelor's",
            skills: ["React", "Node.js"],
            jlptLevel: "N3",
        });
        prismaMock.resume.upsert.mockResolvedValue({
            id: "resume-1",
            userId: "user-1",
            content: "x".repeat(60),
            yearsOfExperience: 5,
            educationLevel: "Bachelor's",
            skillTags: JSON.stringify(["React", "Node.js"]),
            jlptLevel: "N3",
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(200);

        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data.resumeId).toBe("resume-1");
        expect(json.data.yearsOfExperience).toBe(5);
        expect(json.data.educationLevel).toBe("Bachelor's");
        expect(json.data.jlptLevel).toBe("N3");
        // skills must come back as a real array, not a JSON-stringified string
        expect(json.data.skills).toEqual(["React", "Node.js"]);

        expect(prismaMock.resume.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId: "user-1" },
            })
        );
    });

    it("returns 500 when the Claude analyzer throws", async () => {
        vi.mocked(analyzeResume).mockRejectedValue(new Error("Claude API failed"));

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error.type).toBe("UnknownError");
    });
});
