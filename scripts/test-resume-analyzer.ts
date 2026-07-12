import {analyzeResume} from "../lib/resumeAnalyzer";

const sampleResume = `
JOHN DOE
john@example.com | Gainesville, VA | (555) 123-4567

PROFESSIONAL SUMMARY
Full-stack software engineer with 5 years of experience building web applications. Proficient in JavaScript, React, Node.js, and databases. Currently learning Japanese (JLPT N3 level).

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, SQL
- Frontend: React, Next.js, Tailwind CSS, HTML/CSS
- Backend: Node.js, Express, PostgreSQL, MongoDB
- Tools: Git, Docker, AWS, Vercel

EDUCATION
Bachelor of Science in Computer Science
University of Virginia, 2020

PROFESSIONAL EXPERIENCE

Senior Frontend Developer
Tech Company A | 2022 - Present | 2 years
- Led development of React-based dashboard
- Mentored 3 junior developers
- Reduced bundle size by 40%

Full-Stack Developer
Tech Company B | 2020 - 2022 | 2 years
- Built RESTful APIs with Node.js and Express
- Developed React frontends
- Managed PostgreSQL databases

Junior Developer
Tech Company C | 2019 - 2020 | 1 year
- Fixed bugs and implemented features
- Wrote unit tests with Jest`;

async function test() {
    try {
        console.log("Testing resume analyzer...\n");
        const result = await analyzeResume(sampleResume);
        console.log("Successfully parsed resume data:\n", result);
        console.log("Result:\n", JSON.stringify(result, null, 2));
    } catch (error) {
        console.log("Error:\n", error);
        process.exit(1);
    }
}

test();