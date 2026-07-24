import { STATUSES, STATUS_LABELS } from "@/lib/status";
import type { Application } from "@/db/schema";

export function StatsStrip({ applications }: { applications: Application[] }) {
  const counts = STATUSES.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  })).filter((s) => s.count > 0);

  if (counts.length === 0) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {applications.length} total ·{" "}
      {counts.map((s, i) => (
        <span key={s.status}>
          {i > 0 ? " · " : ""}
          {s.count} {STATUS_LABELS[s.status]}
        </span>
      ))}
    </p>
  );
}
