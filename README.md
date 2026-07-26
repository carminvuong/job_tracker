# job tracker
I actually use this — I am getting too forgetful to keep track of jobs/internships I apply for.

also I don't like the free online ones that are available, they have too much stuff going on...

**[Live demo](https://job-tracker-demo-rho.vercel.app/)** — no login required, seeded with sample data, read-only (any edit/add/delete just shows a toast instead of saving).

## Features

- **URL autofill** — paste a job posting link and it reads the page's JSON-LD `JobPosting` data (used by Greenhouse, Lever, Workday, etc.) to fill in company/role/location, falling back to the page title if there's no structured data.
- **Status pipeline** — Applied → OA → OA Done → Interview → Interview Done → Offer / Rejected, changeable inline from the table.
- **Deadlines** — set a deadline while an application is at the OA or Interview stage; it's color-coded (amber within 3 days, red if overdue).
- **Search + filter** — search across company/role/location/notes, and filter by status.

## Stack

Next.js (App Router, TS) · Drizzle ORM · Neon Postgres · Tailwind + shadcn/ui · deployed on Vercel.

## Setup

This is for running it locally. A Neon DB setup is needed beforehand (for ```DATABASE_URL```)

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, APP_PASSWORD
npm run db:push              # push schema to Neon database
npm run dev
```
