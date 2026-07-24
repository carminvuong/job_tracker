# job_tracker

genuinely for personal use - I am too forgetful to keep track of j*bs/internships I apply for.

also the online ones aren't that good...

Paste a job posting URL and it auto-fills the role/company (via Claude) into a tracking dashboard.

## Stack

Next.js (App Router, TS) · Drizzle ORM · Neon Postgres · Anthropic API · Tailwind + shadcn/ui · deployed on Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, ANTHROPIC_API_KEY, APP_PASSWORD
npm run db:push              # push schema to your Neon database
npm run dev
```
