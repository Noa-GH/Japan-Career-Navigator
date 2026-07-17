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
- **Database**: SQLite (local development) with Prisma ORM 5.19
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

**Frontend UI**

- Dashboard for viewing resume analysis results
- Job browsing and matching interface
- Career insights visualization
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

The application uses SQLite for local development with the following key relationships:

**Note**: Array fields (skillTags, keySkillsNeeded, nextSteps) are stored as JSON strings to accommodate SQLite limitations.

- **User** → Resume (one-to-one)
- **User** → JobMatch (one-to-many)
- **User** → CareerInsight (one-to-many)
- **JobListing** → JobMatch (one-to-many)
- **JobListing** → JobInsight (one-to-one)

## Environment Variables

Required environment variables (see `.env` for reference):

- `DATABASE_URL` - SQLite connection string (default: `file:./dev.db`)
- `ANTHROPIC_API_KEY` - Claude API key for AI features

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key
- SQLite (included with Prisma)

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates SQLite database)
npx prisma migrate dev

# Seed database with test data
npx tsx scripts/seed.ts

# Test resume analyzer independently
npx tsx scripts/test-resume-analyzer.ts
```

### Development

```bash
npm run dev
```

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
│   └── api/
│       ├── career/insights/    # Career insights generation
│       ├── jobs/match/         # Job matching logic
│       └── resume/             # Resume analysis
├── lib/
│   ├── errorHandler.ts         # Centralized error handling
│   ├── prisma.ts              # Prisma client singleton
│   └── resumeAnalyzer.ts      # Claude resume analysis
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database file
├── scripts/
│   ├── seed.ts                # Database seeding script
│   └── test-resume-analyzer.ts # Resume analyzer test script
└── public/                    # Static assets
```

## Development Notes

- Uses Next.js App Router with TypeScript
- Claude AI structured outputs ensure consistent data formats
- All API endpoints include comprehensive validation
- Database queries are logged in development mode
- Error handling provides detailed error messages for debugging
- SQLite used for local development (can migrate to PostgreSQL for production)
- Array fields stored as JSON strings to accommodate SQLite limitations

## Recent Changes

**Database Migration**

- Migrated from PostgreSQL to SQLite for local development
- Updated schema to store array fields as JSON strings (skillTags, keySkillsNeeded, nextSteps)
- Created dev.db SQLite database file
- Updated environment configuration for SQLite

**New Development Tools**

- Added seed.ts script for populating database with test data
- Added test-resume-analyzer.ts for standalone Claude API testing
- Included tsx for running TypeScript scripts

**Testing Infrastructure**

- Created test user (noah@example.com) with ID: test-user-001
- Added 3 sample job listings for testing API endpoints
- Seed script outputs test data IDs for easy Postman/testing reference

## Next Steps

**Immediate Priorities**

1. Build frontend UI for resume upload and analysis display
2. Create dashboard for viewing job matches and career insights
3. Implement job search and filtering interface

**Future Enhancements** 4. Implement job listing scraping from TokyoDev/JapanDev 5. Add user authentication (NextAuth.js or similar) 6. Add file upload for PDF/DOCX resumes 7. Migrate to PostgreSQL for production deployment 8. Add email notifications for job matches 9. Integrate Japanese language learning resources 10. Add visa application guidance features
