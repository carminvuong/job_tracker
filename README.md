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
