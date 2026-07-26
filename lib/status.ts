import type { Application } from "@/db/schema";

export const STATUSES = [
  "applied",
  "oa",
  "oa_done",
  "interview",
  "interview_done",
  "offer",
  "rejected",
] as const;

export type Status = Application["status"];

export const STATUS_LABELS: Record<Status, string> = {
  applied: "Applied",
  oa: "OA",
  oa_done: "OA Done",
  interview: "Interview",
  interview_done: "Interview Done",
  offer: "Offer",
  rejected: "Rejected",
};

export const STATUS_BADGE_CLASS: Record<Status, string> = {
  applied: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  oa: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  oa_done: "bg-amber-600/10 text-amber-700 dark:text-amber-500",
  interview: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  interview_done: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  offer: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
};

// Deadlines only make sense while a job is actively pending a next step.
export const DEADLINE_STATUSES: Status[] = ["oa", "interview"];
