import { NextRequest } from "next/server";

export function buildRequest(
    body: unknown,
    url = "http://localhost/api/test",
    method = "POST"
) {
    return new NextRequest(url, {
        method,
        body: method === "GET" ? undefined : JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}
