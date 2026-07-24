# job tracker

genuinely for personal use - I am too forgetful to keep track of jobs/internships I apply for.

also the online ones aren't that good... (they have too much stuff)

## Stack

Next.js (App Router, TS) · Drizzle ORM · Neon Postgres · Tailwind + shadcn/ui · deployed on Vercel.

Pasting a job URL auto-fills role/company by reading the page's JSON-LD `JobPosting` data (used by Greenhouse, Lever, Workday, etc.) with a plain meta-tag fallback — no LLM involved.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, APP_PASSWORD
npm run db:push              # push schema to your Neon database
npm run dev
```

## Public demo

To share a read-only demo (e.g. with recruiters) without handing out your real password:

1. Create a separate Neon database/branch and a second Vercel project pointing at this same repo.
2. Set its env vars: a fresh `DATABASE_URL` for that database, and `DEMO_MODE=true` (`APP_PASSWORD` isn't needed).
3. Run `npm run db:seed` against that database to load sample applications.

With `DEMO_MODE=true` the password gate is skipped entirely and every write action (add, edit, delete, status/deadline changes, URL autofill) becomes a no-op that shows a toast instead — visitors can click around freely without touching real data or being able to spam the deployment.
