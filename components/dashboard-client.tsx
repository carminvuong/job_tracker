"use client";

import { useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationsTable } from "@/components/applications-table";
import { ApplicationDialog } from "@/components/application-dialog";
import { StatsStrip } from "@/components/stats-strip";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/status";
import type { Application } from "@/db/schema";

export function DashboardClient({ applications }: { applications: Application[] }) {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | undefined>(undefined);
  const [addDialogNonce, setAddDialogNonce] = useState(0);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? applications
        : applications.filter((a) => a.status === statusFilter),
    [applications, statusFilter]
  );

  function openAddDialog() {
    setEditingApplication(undefined);
    setAddDialogNonce((n) => n + 1);
    setDialogOpen(true);
  }

  function openEditDialog(application: Application) {
    setEditingApplication(application);
    setDialogOpen(true);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatsStrip applications={applications} />
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openAddDialog}>
            <PlusIcon data-icon="inline-start" />
            Add application
          </Button>
        </div>
      </div>

      <ApplicationsTable applications={filtered} onEdit={openEditDialog} />

      <ApplicationDialog
        key={editingApplication?.id ?? `new-${addDialogNonce}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editingApplication}
      />
    </div>
  );
}
