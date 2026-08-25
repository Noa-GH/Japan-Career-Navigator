import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleError, ValidationError, ConflictError } from "@/lib/errorHandler";

const registerSchema = z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = registerSchema.safeParse(body);

        if (!parsed.success) {
            throw new ValidationError("Invalid registration data", parsed.error.flatten());
        }

        const { name, email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new ConflictError("An account with this email already exists", { email });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword },
        });

        return NextResponse.json(
            {
                success: true,
                data: { id: user.id, email: user.email, name: user.name },
            },
            { status: 201 }
        );
    } catch (error) {
        return handleError(error);
    }
}
