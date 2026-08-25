# Japan Career Navigator Application

An AI-powered career navigation platform for professionals seeking opportunities in Japan's tech industry. The application leverages Claude AI to analyze resumes, match candidates with job listings, and provide personalized career insights.

## Project Overview

This project helps foreign professionals navigate the Japanese job market by:

- Analyzing resumes and extracting key qualifications (experience, skills, education, JLPT level)
- Matching user profiles against Japan-focused job listings
- Generating personalized career pathway recommendations
- Providing visa eligibility assessments

## Tech Stack

- **Framework**: Next.js 16.2.10 (App Router)
- **Frontend**: React 19.2.7, TypeScript
- **Styling**: TailwindCSS 3.4
- **Database**: PostgreSQL (via local Supabase stack) with Prisma ORM 5.19
- **AI**: Anthropic Claude API (claude-sonnet-4-6)
- **Auth**: NextAuth.js / Auth.js v5 (credentials provider, JWT sessions), bcryptjs password hashing
- **Validation**: Zod 4.4.3
- **Script Execution**: tsx 4.23.0

## Current Status

### ✅ Completed Features

**Backend API Infrastructure**

- Database schema with 6 models: User, Resume, JobListing, JobInsight, JobMatch, CareerInsight
- PostgreSQL (local Supabase stack) for local development
- Prisma client configuration with query logging
- Centralized error handling utilities

**Development Tools**

- Database seeding script (`scripts/seed.ts`) for test data generation
- Resume analyzer test script (`scripts/test-resume-analyzer.ts`) for standalone testing
- Test user and sample job listings for API testing
- Vitest suite covering all three API routes (`npm test`)

**Frontend UI**

- Multi-page app with a shared nav (`app/ui/nav.tsx`): `/` (home), `/resume`, `/jobs`, `/insights`, `/profile`, plus `/login` and `/register`
- Job listings are read directly from the database in a Server Component; mutations go through the real API routes via `fetch`
- Simple, consistent styling reusing the existing Tailwind CSS-variable palette (`app/globals.css`) — not a full design system. See `docs/CHANGELOG.md` for details.

**Authentication & Profile Management**

- NextAuth.js v5 (Auth.js) credentials provider, JWT sessions, bcrypt-hashed passwords (`lib/auth.ts`)
- `POST /api/auth/register` for account creation; `/login` and `/register` pages
- Route protection via `proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`) redirects unauthenticated page requests to `/login`; every API route independently checks the session and returns 401 rather than relying on the proxy matcher alone
- `/profile` page + `GET`/`PATCH /api/profile` for basic name/email editing
- The three AI endpoints below now derive `userId` from the authenticated session instead of a client-supplied `userId` field

**AI-Powered Endpoints**

- `POST /api/resume` - Resume analysis endpoint
  - Extracts years of experience, education level, technical skills
  - Identifies Japanese language proficiency (JLPT level)
  - Uses Claude structured outputs for consistent data extraction
  - Stores analysis in the database

- `POST /api/jobs/match` - Job matching endpoint
  - Compares user resume against specific job listings
  - Calculates match score (0-100) using Claude AI
  - Provides reasoning for match quality
  - Assesses visa sponsorship eligibility
  - Stores match results for historical tracking

- `POST /api/career/insights` - Career insights endpoint
  - Analyzes user's resume and job match history
  - Generates personalized career pathway recommendations
  - Provides actionable next steps (3-5 specific actions)
  - Estimates timeline for achieving career goals
  - Stores insights for future reference

### 🚧 In Progress / Planned Features

**Job Data Ingestion**

- Scrapers for TokyoDev and JapanDev job boards
- Automated job listing updates
- Job insight generation pipeline

**Additional Features**

- Email notifications for job matches
- Resume upload and parsing (PDF/DOCX)
- Japanese language learning resources integration
- Visa application guidance

## Database Schema

The application uses PostgreSQL (a local Supabase stack in development) with the following key relationships:

**Note**: Array fields (skillTags, keySkillsNeeded, nextSteps) are stored as JSON strings — a holdover from an earlier SQLite-backed iteration — and parsed/stringified at the API boundary rather than using native array columns.

- **User** → Resume (one-to-one)
- **User** → JobMatch (one-to-many)
- **User** → CareerInsight (one-to-many)
- **JobListing** → JobMatch (one-to-many)
- **JobListing** → JobInsight (one-to-one)

## Environment Variables

Required environment variables (see `.env.example` for reference):

- `DATABASE_URL` - PostgreSQL connection string (local Supabase default: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`)
- `ANTHROPIC_API_KEY` - Claude API key for AI features
- `AUTH_SECRET` - Secret used to sign NextAuth session tokens. Generate with `npx auth secret`

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key
- Docker Desktop (for the local Supabase/Postgres stack)

### Installation

```bash
npm install
```

### Database Setup

```bash
# Start local Supabase (Postgres) — requires Docker Desktop running
npx supabase start

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database with test data
npx tsx scripts/seed.ts

# Test resume analyzer independently
npx tsx scripts/test-resume-analyzer.ts
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` and register a new account, or sign in with the seeded test user (`noah@example.com` / `password123`, printed by `scripts/seed.ts`).

The API endpoints will be available at:

- `http://localhost:3000/api/resume`
- `http://localhost:3000/api/jobs/match`
- `http://localhost:3000/api/career/insights`

## API Usage Examples

All three endpoints below require an authenticated session (the NextAuth session cookie) — `userId` is derived server-side from the session rather than passed in the request body.

### Analyze Resume

```bash
POST /api/resume
{
  "resumeText": "Your resume content here..."
}
```

### Match Job

```bash
POST /api/jobs/match
{
  "jobListingId": "job-listing-id-here"
}
```

### Generate Career Insights

```bash
POST /api/career/insights
```

**Note**: `japan-career-navigator.postman_collection.json` still sends the old `userId`-in-body shape and hasn't been updated for cookie-based auth — a known gap, out of scope for this change.

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx      # Sign-in form
│   │   └── register/page.tsx   # Registration form
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth route handler
│   │   ├── auth/register/      # Account creation
│   │   ├── career/insights/    # Career insights generation
│   │   ├── jobs/match/         # Job matching logic
│   │   ├── profile/            # Profile GET/PATCH
│   │   └── resume/             # Resume analysis
│   ├── resume/, jobs/, insights/, profile/  # Feature pages (Server Component + client form/list)
│   ├── ui/
│   │   └── nav.tsx             # Shared nav bar
│   ├── providers.tsx           # SessionProvider wrapper
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Authenticated home page (Server Component)
│   └── globals.css             # Tailwind entry point
├── lib/
│   ├── auth.ts                 # NextAuth config (credentials provider, JWT sessions)
│   ├── errorHandler.ts         # Centralized error handling
│   ├── prisma.ts              # Prisma client singleton
│   └── resumeAnalyzer.ts      # Claude resume analysis
├── types/
│   └── next-auth.d.ts          # Session/JWT type augmentation
├── proxy.ts                    # Route protection (Next 16's `middleware.ts` replacement)
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # PostgreSQL migrations
├── scripts/
│   ├── seed.ts                # Database seeding script
│   └── test-resume-analyzer.ts # Resume analyzer test script
├── __tests__/                  # Vitest suite
├── docs/
│   └── CHANGELOG.md           # Dated record of notable changes
└── public/                    # Static assets
```

## Development Notes

- Uses Next.js App Router with TypeScript
- Claude AI structured outputs ensure consistent data formats
- All API endpoints include comprehensive validation
- Database queries are logged in development mode
- Error handling provides detailed error messages for debugging
- PostgreSQL via a local Supabase stack for local development
- Array fields stored as JSON strings — a holdover from an earlier SQLite iteration

## Recent Changes

See [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for a dated, per-commit record of notable changes, including the database migration history, testing infrastructure, and the frontend UI build-out.

## Next Steps

**Immediate Priorities**

1. Add credits to the Anthropic account behind `ANTHROPIC_API_KEY` and verify the three AI endpoints end-to-end. The key itself now authenticates correctly; the only remaining blocker is account billing (`invalid_request_error: Your credit balance is too low`) — see `docs/CHANGELOG.md`
2. Implement job search and filtering interface

**Future Enhancements**

3. Implement job listing scraping from TokyoDev/JapanDev
4. Add file upload for PDF/DOCX resumes
5. Add email notifications for job matches
6. Integrate Japanese language learning resources
7. Add visa application guidance features
8. Harden the credentials auth flow for real production use (rate limiting, account lockout, password reset) — the current implementation is a reasonable baseline, not production-hardened
