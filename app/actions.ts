"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { fetchJobInfo, type ExtractedJobDetails } from "@/lib/scrape";
import type { Status } from "@/lib/status";

export type ExtractResult =
  | ({ ok: true } & ExtractedJobDetails)
  | { ok: false; error: string };

export async function getExtractedJobInfo(url: string): Promise<ExtractResult> {
  try {
    const details = await fetchJobInfo(url);
    return { ok: true, ...details };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to fetch job details",
    };
  }
}

export type ApplicationInput = {
  url: string;
  company: string;
  role: string;
  location?: string | null;
  status: Status;
  dateApplied: string;
  deadline?: string | null;
  notes?: string | null;
};

export async function createApplication(input: ApplicationInput) {
  await db.insert(applications).values({
    url: input.url,
    company: input.company,
    role: input.role,
    location: input.location || null,
    status: input.status,
    dateApplied: input.dateApplied,
    deadline: input.deadline || null,
    notes: input.notes || null,
  });
  revalidatePath("/");
}

export async function updateApplication(id: string, input: ApplicationInput) {
  await db
    .update(applications)
    .set({
      url: input.url,
      company: input.company,
      role: input.role,
      location: input.location || null,
      status: input.status,
      dateApplied: input.dateApplied,
      deadline: input.deadline || null,
      notes: input.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id));
  revalidatePath("/");
}

export async function updateApplicationStatus(id: string, status: Status) {
  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/");
}

export async function updateApplicationDeadline(id: string, deadline: string | null) {
  await db
    .update(applications)
    .set({ deadline, updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/");
}

export async function deleteApplication(id: string) {
  await db.delete(applications).where(eq(applications.id, id));
  revalidatePath("/");
}
