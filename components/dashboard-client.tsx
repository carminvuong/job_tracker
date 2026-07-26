"use client";

import { useMemo, useState } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { SPRING_BUTTON_CLASS } from "@/lib/utils";
import type { Application } from "@/db/schema";

export function DashboardClient({ applications }: { applications: Application[] }) {
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<Application | undefined>(undefined);
  const [addDialogNonce, setAddDialogNonce] = useState(0);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!query) return true;
      return [a.company, a.role, a.location, a.notes].some((field) =>
        field?.toLowerCase().includes(query)
      );
    });
  }, [applications, statusFilter, search]);

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
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, role, notes..."
              className="h-7 w-56 pl-8 text-[0.8rem]"
            />
          </div>
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
          <Button onClick={openAddDialog} className={SPRING_BUTTON_CLASS}>
            <PlusIcon data-icon="inline-start" />
            Add application
          </Button>
        </div>
      </div>

      <ApplicationsTable
        applications={filtered}
        onEdit={openEditDialog}
        isFiltered={statusFilter !== "all" || search.trim().length > 0}
      />

      <ApplicationDialog
        key={editingApplication?.id ?? `new-${addDialogNonce}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editingApplication}
      />
    </div>
  );
}
