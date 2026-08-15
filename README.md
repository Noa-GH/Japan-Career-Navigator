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
- **Validation**: Zod 4.4.3
- **Script Execution**: tsx 4.23.0

## Current Status

### ✅ Completed Features

**Backend API Infrastructure**

- Database schema with 6 models: User, Resume, JobListing, JobInsight, JobMatch, CareerInsight
- SQLite database for local development (dev.db)
- Prisma client configuration with query logging
- Centralized error handling utilities

**Development Tools**

- Database seeding script (`scripts/seed.ts`) for test data generation
- Resume analyzer test script (`scripts/test-resume-analyzer.ts`) for standalone testing
- Test user and sample job listings for API testing
- Vitest suite covering all three API routes (`npm test`)

**Frontend UI (dev-build test harness)**

- Single-page dashboard (`app/page.tsx` + `app/ui/dashboard.tsx`) exercising all three API endpoints: resume analysis, per-job matching, and career insights generation
- Job listings are read directly from the database in a Server Component; mutations go through the real API routes via `fetch`
- Deliberately minimal styling — this is a working end-to-end harness, not a final design. See `docs/CHANGELOG.md` for details.

**AI-Powered Endpoints**

- `POST /api/resume` - Resume analysis endpoint
  - Extracts years of experience, education level, technical skills
  - Identifies Japanese language proficiency (JLPT level)
  - Uses Claude structured outputs for consistent data extraction
  - Stores analysis in SQLite database

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

**Frontend UI polish**

- Replace the current mocked-up dashboard with a real design system
- Multi-page navigation instead of a single scrolling page
- User profile management

**Job Data Ingestion**

- Scrapers for TokyoDev and JapanDev job boards
- Automated job listing updates
- Job insight generation pipeline

**User Management**

- User authentication system
- User registration/login flows
- Profile management

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

Required environment variables (see `.env` for reference):

- `DATABASE_URL` - PostgreSQL connection string (local Supabase default: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`)
- `ANTHROPIC_API_KEY` - Claude API key for AI features

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

Visit `http://localhost:3000` for the dashboard UI, which exercises the API endpoints below.

The API endpoints will be available at:

- `http://localhost:3000/api/resume`
- `http://localhost:3000/api/jobs/match`
- `http://localhost:3000/api/career/insights`

## API Usage Examples

### Analyze Resume

```bash
POST /api/resume
{
  "resumeText": "Your resume content here...",
  "userId": "user-id-here"
}
```

### Match Job

```bash
POST /api/jobs/match
{
  "userId": "user-id-here",
  "jobListingId": "job-listing-id-here"
}
```

### Generate Career Insights

```bash
POST /api/career/insights
{
  "userId": "user-id-here"
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── career/insights/    # Career insights generation
│   │   ├── jobs/match/         # Job matching logic
│   │   └── resume/             # Resume analysis
│   ├── ui/
│   │   └── dashboard.tsx       # Client component driving all 3 endpoints
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Dashboard page (Server Component)
│   └── globals.css             # Tailwind entry point
├── lib/
│   ├── errorHandler.ts         # Centralized error handling
│   ├── prisma.ts              # Prisma client singleton
│   └── resumeAnalyzer.ts      # Claude resume analysis
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

1. Get a valid `ANTHROPIC_API_KEY` into `.env` and verify the three AI endpoints end-to-end (currently blocked — see `docs/CHANGELOG.md`)
2. Replace the mocked-up dashboard with a real design system
3. Implement job search and filtering interface

**Future Enhancements** 4. Implement job listing scraping from TokyoDev/JapanDev 5. Add user authentication (NextAuth.js or similar) 6. Add file upload for PDF/DOCX resumes 7. Add email notifications for job matches 8. Integrate Japanese language learning resources 9. Add visa application guidance features
