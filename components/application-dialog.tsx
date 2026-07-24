"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createApplication,
  getExtractedJobInfo,
  updateApplication,
  type ApplicationInput,
} from "@/app/actions";
import { DEADLINE_STATUSES, STATUSES, STATUS_LABELS, type Status } from "@/lib/status";
import type { Application } from "@/db/schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application;
};

function toFormState(application?: Application): ApplicationInput {
  if (!application) {
    return {
      url: "",
      company: "",
      role: "",
      location: "",
      status: "applied",
      dateApplied: new Date().toISOString().slice(0, 10),
      deadline: "",
      notes: "",
    };
  }
  return {
    url: application.url,
    company: application.company,
    role: application.role,
    location: application.location ?? "",
    status: application.status,
    dateApplied: application.dateApplied,
    deadline: application.deadline ?? "",
    notes: application.notes ?? "",
  };
}

export function ApplicationDialog({ open, onOpenChange, application }: Props) {
  const isEdit = Boolean(application);
  const [form, setForm] = useState<ApplicationInput>(() => toFormState(application));
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isFetching, startFetching] = useTransition();
  const [isSaving, startSaving] = useTransition();

  function handleFetchDetails() {
    if (!form.url) {
      setFetchError("Paste a job posting URL first");
      return;
    }
    setFetchError(null);
    startFetching(async () => {
      const result = await getExtractedJobInfo(form.url);
      if (!result.ok) {
        setFetchError(result.error);
        toast.error(result.error);
        return;
      }
      setForm((prev) => ({
        ...prev,
        company: result.company || prev.company,
        role: result.role || prev.role,
        location: result.location ?? prev.location,
      }));
      toast.success("Details fetched — review before saving");
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    startSaving(async () => {
      if (isEdit && application) {
        await updateApplication(application.id, form);
        toast.success("Application updated");
      } else {
        await createApplication(form);
        toast.success("Application added");
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit application" : "Add application"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">Job posting URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
              <Button type="button" variant="outline" onClick={handleFetchDetails} disabled={isFetching}>
                {isFetching ? "Fetching..." : "Fetch details"}
              </Button>
            </div>
            {fetchError ? <p className="text-sm text-destructive">{fetchError}</p> : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                required
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                required
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dateApplied">Date applied</Label>
              <Input
                id="dateApplied"
                type="date"
                required
                value={form.dateApplied}
                onChange={(e) => setForm((f) => ({ ...f, dateApplied: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.status}
              onValueChange={(value) => setForm((f) => ({ ...f, status: value as Status }))}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {DEADLINE_STATUSES.includes(form.status) ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Add application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
