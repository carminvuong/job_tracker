"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { fetchJobInfo, type ExtractedJobDetails } from "@/lib/scrape";
import type { Status } from "@/lib/status";
import { isDemoMode, DEMO_DISABLED_MESSAGE } from "@/lib/demo";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type ExtractResult =
  | ({ ok: true } & ExtractedJobDetails)
  | { ok: false; error: string };

export async function getExtractedJobInfo(url: string): Promise<ExtractResult> {
  if (isDemoMode()) return { ok: false, error: DEMO_DISABLED_MESSAGE };

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

export async function createApplication(input: ApplicationInput): Promise<ActionResult> {
  if (isDemoMode()) return { ok: false, error: DEMO_DISABLED_MESSAGE };

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
  return { ok: true };
}

export async function updateApplication(id: string, input: ApplicationInput): Promise<ActionResult> {
  if (isDemoMode()) return { ok: false, error: DEMO_DISABLED_MESSAGE };

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
  return { ok: true };
}

export async function updateApplicationStatus(id: string, status: Status): Promise<ActionResult> {
  if (isDemoMode()) return { ok: false, error: DEMO_DISABLED_MESSAGE };

  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/");
  return { ok: true };
}

export async function updateApplicationDeadline(id: string, deadline: string | null): Promise<ActionResult> {
  if (isDemoMode()) return { ok: false, error: DEMO_DISABLED_MESSAGE };

  await db
    .update(applications)
    .set({ deadline, updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/");
  return { ok: true };
}

export async function deleteApplication(id: string): Promise<ActionResult> {
  if (isDemoMode()) return { ok: false, error: DEMO_DISABLED_MESSAGE };

  await db.delete(applications).where(eq(applications.id, id));
  revalidatePath("/");
  return { ok: true };
}
