# Changelog

Record of notable changes to the Japan Career Navigator application, kept for project history. Dates reflect commit dates on `Claude-API-Integration`.

## 2026-08-25 — Authentication, profile management, and multi-page restructure

Scoped push toward a production-ready build: basic auth, profile management, a real multi-page UI, and deploy-readiness. Job scraping, email notifications, PDF/DOCX upload, JP language resources, and visa guidance remain out of scope (see README's Planned Features).

**Authentication**

- Added NextAuth.js v5 (Auth.js), credentials provider, JWT-only sessions (no Prisma adapter — avoids adding `Account`/`Session`/`VerificationToken` tables). Config lives in `lib/auth.ts`; exports `{ handlers, auth, signIn, signOut }`.
- Passwords hashed with `bcryptjs` (pure JS, avoids native build-toolchain risk on unknown deploy targets).
- `prisma/schema.prisma`: added `User.password String?` — nullable and additive, safe for the existing seeded row (migration `20260825155630_add_user_password`).
- New routes: `app/api/auth/[...nextauth]/route.ts` (NextAuth handler), `app/api/auth/register/route.ts` (zod-validated registration; NextAuth's Credentials provider doesn't create users on its own).
- New pages: `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`.
- Route protection via `proxy.ts` at the repo root — **not** `middleware.ts`; Next.js 16 renamed the file convention and silently ignores the old name. The `auth()` wrapper only redirects unauthenticated requests because `lib/auth.ts` defines a `callbacks.authorized` — without it, the default is to allow every request through.
- Every API route (the 3 existing AI routes, plus the new profile route) independently calls `auth()` and returns 401 rather than relying on the proxy matcher alone, per Next's own guidance that a matcher change can silently drop coverage.
- `lib/errorHandler.ts`: added `UnauthorizedError` (401) and `ConflictError` (409) to the existing `APIError` hierarchy.
- `scripts/seed.ts`: seeded user now gets a bcrypt-hashed password (`password123`), printed to console alongside the existing ID/email output.

**Breaking change to the 3 AI endpoints (intentional)**

- `POST /api/resume`, `POST /api/jobs/match`, `POST /api/career/insights` no longer accept `userId` in the request body — it's derived from the authenticated session instead. This closes a real hole in the prior design where any caller could pass an arbitrary `userId` and read or write another user's data.
- `japan-career-navigator.postman_collection.json` was **not** updated for this — it still sends the old `userId`-in-body shape and needs a cookie-based auth flow added before it's usable again. Flagged as a known gap.
- Vitest suite updated to match: new `__tests__/helpers/mockAuth.ts` (mocks `@/lib/auth`), each route test file now mocks a session instead of passing `userId`, "missing userId" tests replaced with "401 when unauthenticated" tests, plus a new `__tests__/api/auth-register.test.ts`. All 18 tests pass.

**Profile management**

- `app/profile/page.tsx` (Server Component) + `app/profile/profile-form.tsx` (client) — view/edit name and email.
- `app/api/profile/route.ts` — `GET`/`PATCH`, session-gated, rejects an email already in use by another account.

**Multi-page restructure**

- Retired `app/ui/dashboard.tsx` (the single-page dev-harness with a free-text `userId` field) and split its three sections into real routes: `app/resume/`, `app/jobs/`, `app/insights/`, each a thin Server Component page plus a client form/list component.
- Added `app/ui/nav.tsx` (shared nav bar, session-aware, sign-out button) and `app/providers.tsx` (`SessionProvider` wrapper, keeps `app/layout.tsx` a Server Component).
- `app/page.tsx` rewritten as a short authenticated home/overview linking to the 4 feature pages (its old job-listing fetch moved into `app/jobs/page.tsx`).
- Styling reuses the existing Tailwind CSS-variable palette from `app/globals.css` — no design-system overhaul, per scope.
- `app/jobs/page.tsx` explicitly sets `export const dynamic = "force-dynamic"` — without it, Next statically prerendered the job listings at build time (no `auth()` or other dynamic API call in that page), which would have frozen the list until the next deploy.

**Deploy-readiness**

- `package.json`: added `"postinstall": "prisma generate"` — without it, a fresh `npm install` on a real host wouldn't regenerate the gitignored Prisma client before `next build`.
- Added `.env.example` documenting `DATABASE_URL`, `ANTHROPIC_API_KEY`, and the new `AUTH_SECRET`. **Also fixed `.gitignore`**: the blanket `.env*` rule was silently swallowing `.env.example` too — added `!.env.example` so it actually gets committed.
- Verified: `npm run test` (18/18 pass), `npx tsc --noEmit` (clean), `npm run build` (succeeds, including with an invalid `ANTHROPIC_API_KEY` present — the Anthropic client is only instantiated at request time, not at build time).
- Manually smoke-tested the full flow against a live dev server: register → login → session-gated pages redirect correctly when logged out, session-gated API routes 401 correctly without a cookie, profile GET/PATCH work, seeded user login works.

**`ANTHROPIC_API_KEY` status update**

- The key was replaced with a new one. It now authenticates successfully against Anthropic (the prior `401 authentication_error` is gone).
- The account behind it currently has no billing credit: `POST /api/resume` returns a live `400 invalid_request_error: Your credit balance is too low to access the Anthropic API`. This is an account/billing issue, not a code issue — no further changes needed here once credits are added.
- Also fixed: `.env.local` had a stale copy of the old invalid key. Next.js loads `.env.local` with higher priority than `.env`, so the new key in `.env` alone would not have taken effect — both files now match.

## 2026-08-15 — Frontend UI (dev-build test harness)

- Rebuilt the `app` shell removed in the 2026-07-12 API-first pivot: `app/layout.tsx` (root layout, metadata) and `app/globals.css` (Tailwind).
- Added `app/page.tsx`, a Server Component that reads job listings directly via Prisma (no new API route needed for a read) and passes them into `app/ui/dashboard.tsx`, a Client Component with three sections mapped 1:1 to the existing endpoints:
  1. **Analyze resume** — textarea + userId field → `POST /api/resume`, renders years of experience / education / JLPT level / skill tags.
  2. **Match jobs** — one card per seeded job listing with a per-job "Match" button → `POST /api/jobs/match`, renders score / reasoning / visa eligibility inline, with independent loading/error state per job.
  3. **Generate career insights** → `POST /api/career/insights`, renders the insight text, next-steps list, and estimated timeline.
- This is intentionally a plain, unstyled-beyond-basic-Tailwind pass — a working end-to-end harness to validate the API surface, not a final design. Restyling to a real design system is expected as a follow-up.
- **Fixed two pre-existing bugs found while standing up the dev server, unrelated to the frontend code itself:**
  - `package.json`'s `dev` script passed `--open` to `next dev`, which this Next.js version's CLI does not support (`error: unknown option '--open'`) — the dev server could not start at all. Removed the flag.
  - `postcss.config.mjs` was wired for the Tailwind **v4** PostCSS plugin (`@tailwindcss/postcss`) while `tailwindcss@3.4.19` (a v3-shape package with no CSS-importable entry point) is what's actually pinned in `package.json` and installed. This crashed every page render (`Can't resolve 'tailwindcss'`). Reconfigured `postcss.config.mjs` to use the classic `tailwindcss` + `autoprefixer` v3 plugins (both already installed, unused until now) and added `tailwind.config.ts`. `app/globals.css` uses the matching `@tailwind base/components/utilities` v3 directives. The now fully-unused `@tailwindcss/postcss` devDependency (v4) is a candidate for removal in a follow-up cleanup.
- Verified end-to-end against a live local stack (Docker + `supabase start` local Postgres, `prisma migrate deploy`, `scripts/seed.ts`) and in an actual browser: page renders, form/button interactions fire the correct requests, and both success-shaped plumbing (DB reads/writes, validation, Prisma) and error-shaped plumbing (missing resume, missing user) work correctly.
  - **Not verified**: the actual Claude-calling paths (resume analysis, job matching, career insights generation) — the `ANTHROPIC_API_KEY` in `.env` is rejected by Anthropic with `401 authentication_error`. Every other part of each request (routing, validation, Prisma reads/writes, error formatting, and the new UI's handling of both success and error responses) was confirmed working; only the live Claude call itself is unverified. Needs a valid key to close the loop.

## 2026-07-25 — Comprehensive tests and Anthropic SDK format fix

- Added a Vitest suite covering the three API routes (`/api/resume`, `/api/jobs/match`, `/api/career/insights`), each with validation, not-found, success, and upstream-failure cases.
- Added test helpers: `buildRequest` (constructs a mock `NextRequest`), `mockPrisma` (vitest-mock-extended Prisma client), `mockAnthropic`.
- Fixed the Anthropic SDK structured-output config shape across `resumeAnalyzer.ts` and all three routes: `output_config: { type, schema }` → `output_config: { format: { type, schema } }`. The SDK's TypeScript types haven't caught up yet, so this is cast `as any` at each call site.
- Fixed the resume endpoint's response to `JSON.parse` `skillTags` before returning it, so callers receive a real array instead of a JSON-encoded string.
- Tightened error-handler typing: replaced `any` with `unknown` in catch blocks; added an ESLint override disabling `no-explicit-any` for test files only.
- Switched the database provider from SQLite to PostgreSQL (see `prisma/schema.prisma`, new migration `20260725113451_init`) and added a Supabase local-dev config (`supabase/config.toml`) so `DATABASE_URL` now points at a local Supabase Postgres instance rather than the checked-in `dev.db` file.
- Added a Postman collection (`japan-career-navigator.postman_collection.json`) covering all three endpoints for manual testing.

**Note:** the root `README.md` still describes the database as SQLite; that section is now stale following this migration.

## 2026-07-17 — SQLite migration and database seeding

- Switched the local dev database from PostgreSQL to SQLite (later reverted back to PostgreSQL, see above) to simplify first-time setup.
- Because SQLite has no native array column type, `skillTags`, `keySkillsNeeded`, and `nextSteps` are stored as JSON-encoded strings and parsed/stringified at the API boundary.
- Added `scripts/seed.ts`: an idempotent seed script that clears all tables and inserts one test user (`test-user-001`, `noah@example.com`) and three sample job listings (TokyoDev, JapanDev, Tokyo Tech), printing their IDs for manual testing.
- Expanded `README.md` with tech stack, status, setup, and API usage documentation.

## 2026-07-12 — API endpoints and backend infrastructure

- Implemented the three core API routes as Next.js Route Handlers:
  - `POST /api/resume` — analyzes resume text via Claude, upserts a `Resume` row keyed by `userId`.
  - `POST /api/jobs/match` — compares a user's stored resume against a `JobListing`, asks Claude for a match score/reasoning/visa eligibility, upserts a `JobMatch`.
  - `POST /api/career/insights` — summarizes a user's resume + job match history, asks Claude for a career pathway, next steps, and timeline, creates a `CareerInsight`.
- Added `lib/errorHandler.ts`: a shared `APIError` hierarchy (`ValidationError` 400, `NotFoundError` 404, `InternalServerError`/generic 500) and a `handleError()` responder used by every route's `catch` block.
- Added `lib/prisma.ts`: a singleton Prisma client with query logging in development.
- Removed the default `create-next-app` template files (`app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `app/favicon.ico`) as the project pivoted to an API-first build-out — **this is why the frontend UI work starting now is building those back from scratch.**

## 2026-07-08 — Resume analyzer using Claude API

- Added `lib/resumeAnalyzer.ts`: calls Claude (`claude-sonnet-4-6`) with a JSON-schema structured output request to extract `yearsOfExperience`, `educationLevel`, `skills[]`, and `jlptLevel` from raw resume text.

## 2026-07-08 — Initial project configuration

- Base `create-next-app` scaffold (Next.js 16.2.10, App Router, TypeScript, TailwindCSS, ESLint) with Prisma schema defining the six core models: `User`, `Resume`, `JobListing`, `JobInsight`, `JobMatch`, `CareerInsight`.

---

## Known inconsistencies as of this writing

- **Unused dependency**: `@tailwindcss/postcss` (v4) remains in `devDependencies` but nothing references it after the 2026-08-15 PostCSS fix — candidate for removal.
- **Anthropic account has no billing credit**: see the 2026-08-25 entry above. The API key itself is valid; all three AI endpoints will 500 with a billing error until credits are added to the account.
- **Postman collection is stale**: `japan-career-navigator.postman_collection.json` still sends `userId` in the request body for all three AI endpoints; as of 2026-08-25 those routes derive `userId` from the session cookie instead and ignore/reject that field. Needs a cookie-based auth flow added before it's usable again.
- **Credentials auth is a baseline, not production-hardened**: no rate limiting, account lockout, or password reset flow yet (see README's Next Steps).
