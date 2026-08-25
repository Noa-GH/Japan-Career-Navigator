import { vi } from "vitest";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

import { auth } from "@/lib/auth";

export const authMock = auth as unknown as ReturnType<typeof vi.fn>;

export function mockSession(userId: string | null) {
    if (userId === null) {
        authMock.mockResolvedValue(null);
        return;
    }
    authMock.mockResolvedValue({
        user: { id: userId },
        expires: new Date(Date.now() + 60_000).toISOString(),
    });
}
