import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SPRING_BUTTON_CLASS =
  "transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-105 active:scale-95"

// Reformats a "YYYY-MM-DD" date string (as stored/returned by Postgres) to "MM/DD/YYYY"
// for display. Done via string split rather than `Date` to avoid timezone shifting.
export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${month}/${day}/${year}`;
}
