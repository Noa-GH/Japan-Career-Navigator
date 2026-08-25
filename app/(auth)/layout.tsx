export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-sm items-center px-6">
            <div className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-6">
                {children}
            </div>
        </main>
    );
}
