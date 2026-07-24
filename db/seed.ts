import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { applications, type NewApplication } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(neon(process.env.DATABASE_URL));

// Sample data for the public demo deployment — no real applications here.
const SAMPLE_APPLICATIONS: NewApplication[] = [
  {
    url: "https://boards.greenhouse.io/example/jobs/1",
    company: "Anthropic",
    role: "Software Engineer, Applied AI",
    location: "San Francisco, CA",
    status: "interview",
    dateApplied: "2026-06-02",
    deadline: "2026-07-31",
    notes: "Recruiter screen went well. Waiting on onsite scheduling.",
  },
  {
    url: "https://jobs.lever.co/example/2",
    company: "Vercel",
    role: "Frontend Engineer Intern",
    location: "Remote",
    status: "oa",
    dateApplied: "2026-06-10",
    deadline: "2026-07-28",
    notes: "OA is a take-home, due in 5 days.",
  },
  {
    url: "https://example.workday.com/jobs/3",
    company: "Stripe",
    role: "Backend Engineer",
    location: "New York, NY",
    status: "applied",
    dateApplied: "2026-07-01",
    deadline: null,
    notes: null,
  },
  {
    url: "https://boards.greenhouse.io/example/jobs/4",
    company: "Figma",
    role: "Product Engineer",
    location: "San Francisco, CA",
    status: "offer",
    dateApplied: "2026-05-15",
    deadline: null,
    notes: "Verbal offer received, waiting on written offer letter.",
  },
  {
    url: "https://jobs.lever.co/example/5",
    company: "Notion",
    role: "Full Stack Engineer Intern",
    location: "Remote",
    status: "rejected",
    dateApplied: "2026-04-20",
    deadline: null,
    notes: "Rejected after final round — good feedback, will reapply next cycle.",
  },
  {
    url: "https://example.workday.com/jobs/6",
    company: "Databricks",
    role: "Software Engineer",
    location: "Seattle, WA",
    status: "applied",
    dateApplied: "2026-07-10",
    deadline: null,
    notes: null,
  },
  {
    url: "https://boards.greenhouse.io/example/jobs/7",
    company: "Linear",
    role: "Frontend Engineer",
    location: "Remote",
    status: "interview",
    dateApplied: "2026-06-25",
    deadline: "2026-08-01",
    notes: "Final round next week — system design + culture fit.",
  },
];

async function seed() {
  await db.delete(applications);
  await db.insert(applications).values(SAMPLE_APPLICATIONS);
  console.log(`Seeded ${SAMPLE_APPLICATIONS.length} sample applications.`);
}

seed().then(() => process.exit(0));
