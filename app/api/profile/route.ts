import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleError, UnauthorizedError, ValidationError, ConflictError } from "@/lib/errorHandler";

const updateSchema = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email(),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new UnauthorizedError();

        const user = await prisma.user.findUniqueOrThrow({
            where: { id: session.user.id },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new UnauthorizedError();

        const body = await request.json();
        const parsed = updateSchema.safeParse(body);
        if (!parsed.success) {
            throw new ValidationError("Invalid profile data", parsed.error.flatten());
        }

        const { name, email } = parsed.data;

        const emailOwner = await prisma.user.findUnique({ where: { email } });
        if (emailOwner && emailOwner.id !== session.user.id) {
            throw new ConflictError("An account with this email already exists", { email });
        }

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: { name, email },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        return NextResponse.json({ success: true, data: user }, { status: 200 });
    } catch (error) {
        return handleError(error);
    }
}
