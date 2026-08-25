import { NextResponse } from "next/server";

export class APIError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: unknown
    ) {
        super(message);
        this.name = "APIError";
    }
}

export class ValidationError extends APIError {
    constructor(message: string, details?: unknown) {
        super(400, message, details);
        this.name = "ValidationError";
    }
}

export class NotFoundError extends APIError {
    constructor(resource: string) {
        super(404, `${resource} not found`, { resource });
        this.name = "NotFoundError";
    }
}

export class InternalServerError extends APIError {
    constructor(message: string, details?: unknown) {
        super(500, message, details);
        this.name = "InternalServerError";
    }
}

export class UnauthorizedError extends APIError {
    constructor(message = "Authentication required") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}

export class ConflictError extends APIError {
    constructor(message: string, details?: unknown) {
        super(409, message, details);
        this.name = "ConflictError";
    }
}

export function handleError(error: unknown) {
    console.error("[API Error]", error);

    if (error instanceof APIError) {
        return NextResponse.json(
            {
                error: {
                    type: error.name,
                    message: error.message,
                    details: error.details,
                },
            },
            { status: error.statusCode }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            {
                error: {
                    type: "UnknownError",
                    message: error.message,
                },
            },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            error: {
                type: "UnknownError",
                message: "An unexpected error occurred",
            },
        },
        { status: 500 }
    );
}