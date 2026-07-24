"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { MoreHorizontalIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteApplication, updateApplicationDeadline, updateApplicationStatus } from "@/app/actions";
import { DEADLINE_STATUSES, STATUSES, STATUS_LABELS, STATUS_BADGE_CLASS, type Status } from "@/lib/status";
import type { Application } from "@/db/schema";
import { cn } from "@/lib/utils";

type Props = {
  applications: Application[];
  onEdit: (application: Application) => void;
};

function deadlineClass(deadline: string | null): string {
  if (!deadline) return "text-muted-foreground";
  const daysLeft = (new Date(deadline).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000;
  if (daysLeft < 0) return "text-red-600 dark:text-red-400 font-medium";
  if (daysLeft <= 3) return "text-amber-600 dark:text-amber-400 font-medium";
  return "text-muted-foreground";
}

export function ApplicationsTable({ applications, onEdit }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);
  const [, startTransition] = useTransition();

  function handleStatusChange(application: Application, status: Status) {
    startTransition(async () => {
      await updateApplicationStatus(application.id, status);
    });
  }

  function handleDeadlineChange(application: Application, deadline: string) {
    startTransition(async () => {
      await updateApplicationDeadline(application.id, deadline || null);
    });
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      await deleteApplication(target.id);
      toast.success(`Removed ${target.company} — ${target.role}`);
    });
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No applications yet. Paste a job posting URL to add your first one.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.company}</TableCell>
                <TableCell>{application.role}</TableCell>
                <TableCell className="text-muted-foreground">
                  {application.location || "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={application.status}
                    onValueChange={(value) => handleStatusChange(application, value as Status)}
                  >
                    <SelectTrigger size="sm" className="w-fit border-none bg-transparent shadow-none">
                      <Badge className={cn("border-none", STATUS_BADGE_CLASS[application.status])}>
                        {STATUS_LABELS[application.status]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">{application.dateApplied}</TableCell>
                <TableCell>
                  {DEADLINE_STATUSES.includes(application.status) ? (
                    <Input
                      type="date"
                      value={application.deadline ?? ""}
                      onChange={(e) => handleDeadlineChange(application, e.target.value)}
                      className={cn(
                        "h-7 w-36 border-none bg-transparent px-1.5 shadow-none",
                        deadlineClass(application.deadline)
                      )}
                    />
                  ) : (
                    <span className="text-muted-foreground">{application.deadline || "—"}</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreHorizontalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(application)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem render={<a href={application.url} target="_blank" rel="noreferrer" />}>
                        Open posting
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(application)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete application?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `This removes ${deleteTarget.company} — ${deleteTarget.role} permanently.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
