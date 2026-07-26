import { pgTable, uuid, text, date, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "oa",
  "oa_done",
  "interview",
  "interview_done",
  "offer",
  "rejected",
]);

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  location: text("location"),
  status: applicationStatusEnum("status").notNull().default("applied"),
  dateApplied: date("date_applied").notNull().defaultNow(),
  deadline: date("deadline"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
