import { describe, it, expect, vi, beforeEach } from "vitest";
import { prismaMock } from "../helpers/mockPrisma";
import { buildRequest } from "../helpers/buildRequest";

import { POST } from "@/app/api/auth/register/route";

const validBody = { name: "Test User", email: "test@example.com", password: "password123" };

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns 400 for an invalid email", async () => {
        const res = await POST(buildRequest({ ...validBody, email: "not-an-email" }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.type).toBe("ValidationError");
    });

    it("returns 400 for a password under 8 characters", async () => {
        const res = await POST(buildRequest({ ...validBody, password: "short" }));
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error.type).toBe("ValidationError");
    });

    it("returns 409 when the email is already registered", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" } as any);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(409);
        const json = await res.json();
        expect(json.error.type).toBe("ConflictError");
    });

    it("creates the user and returns 201 without leaking the password hash", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({
            id: "user-1",
            email: validBody.email,
            name: validBody.name,
            password: "hashed",
            createdAt: new Date(),
            updatedAt: new Date(),
        } as any);

        const res = await POST(buildRequest(validBody));
        expect(res.status).toBe(201);

        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.data).toEqual({ id: "user-1", email: validBody.email, name: validBody.name });
        expect(json.data.password).toBeUndefined();

        expect(prismaMock.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ email: validBody.email, name: validBody.name }),
            })
        );
        const createCall = prismaMock.user.create.mock.calls[0][0];
        expect(createCall.data.password).not.toBe(validBody.password);
    });
});
