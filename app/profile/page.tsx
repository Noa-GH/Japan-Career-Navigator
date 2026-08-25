import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "./profile-form";

export default async function ProfilePage() {
    const session = await auth();
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: session!.user.id },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    return (
        <main className="mx-auto max-w-2xl px-6 py-10" >
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
            </header>

            <ProfileForm initialName={user.name ?? ""} initialEmail={user.email} />
        </main>
    );
}