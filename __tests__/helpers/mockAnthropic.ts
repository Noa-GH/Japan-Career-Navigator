import { vi } from "vitest";

/**
 * Builds a mock Anthropic constructor whose messages.create() resolves with
 * the given object serialized as the structured-output text block.
 */
export function mockAnthropicResponse(responseData: unknown) {
    return vi.fn().mockImplementation(function MockAnthropic(this: any) {
        this.messages = {
            create: vi.fn().mockResolvedValue({
                content: [{ type: "text", text: JSON.stringify(responseData) }],
            }),
        };
    });
}
