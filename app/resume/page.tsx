import ResumeForm from "./resume-form";

export default function ResumePage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Analyze resume</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Paste your resume text below to extract experience, education, skills, and JLPT level.
                </p>
            </header>

            <ResumeForm />
        </main>
    );
}
