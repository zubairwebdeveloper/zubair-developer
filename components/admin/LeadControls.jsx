"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LEAD_PRIORITIES,
  LEAD_STATUS_LABELS,
  LEAD_TRANSITIONS,
} from "@/constants/lead-status";
import { cn } from "@/lib/utils/cn";
import { fromLocalInput, toLocalInput } from "@/lib/utils/dates";
import { sendJson } from "@/lib/utils/submit-form";

const pad = (value) => String(value).padStart(2, "0");

/** Formats a Date the way <input type="datetime-local"> expects (local time). */
function toLocalString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** A date N days from now at 9:00 local time. */
function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return toLocalString(date);
}

const followUpPresets = [
  { label: "Tomorrow, 9:00", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "Next week", days: 7 },
];

const capitalize = (value) =>
  String(value).charAt(0).toUpperCase() + String(value).slice(1);

export function LeadControls({ lead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [priority, setPriority] = useState(lead.priority ?? "medium");
  const [followUp, setFollowUp] = useState(toLocalInput(lead.followUpAt));
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false); // time-based hints render after mount

  useEffect(() => setMounted(true), []);

  // Only the current status and its allowed transitions. The server enforces this again.
  const transitions = LEAD_TRANSITIONS[lead.status] ?? [];
  const allowedStatuses = [lead.status, ...transitions];

  const savedPriority = lead.priority ?? "medium";
  const savedFollowUp = toLocalInput(lead.followUpAt);
  const isDirty =
    status !== lead.status ||
    priority !== savedPriority ||
    followUp !== savedFollowUp;

  const followUpDate = followUp ? new Date(followUp) : null;
  const isOverdue =
    mounted &&
    followUpDate !== null &&
    !Number.isNaN(followUpDate.getTime()) &&
    followUpDate.getTime() < Date.now();

  async function onSave() {
    const patch = {};
    if (status !== lead.status) patch.status = status;
    if (priority !== savedPriority) patch.priority = priority;
    if (followUp !== savedFollowUp) patch.followUpAt = fromLocalInput(followUp);

    if (Object.keys(patch).length === 0) {
      toast.info("No changes to save.");
      return;
    }

    setSaving(true);
    try {
      await sendJson("PATCH", `/api/admin/leads/${lead.id}`, patch);
      toast.success("Lead updated");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    setStatus(lead.status);
    setPriority(savedPriority);
    setFollowUp(savedFollowUp);
  }

  return (
    <FieldGroup>
      {/* Status */}
      <Field>
        <FieldLabel htmlFor="lead-status">Status</FieldLabel>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="lead-status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedStatuses.map((value) => (
              <SelectItem key={value} value={value}>
                {LEAD_STATUS_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>
          {transitions.length > 0
            ? `You can move this lead to: ${transitions
                .map((value) => LEAD_STATUS_LABELS[value])
                .join(", ")}.`
            : "This lead has no further status changes."}
        </FieldDescription>
      </Field>

      {/* Priority */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium leading-none">
          Priority
        </legend>
        <div className="flex flex-wrap gap-2">
          {LEAD_PRIORITIES.map((value) => {
            const id = `lead-priority-${value}`;
            return (
              <div key={value} className="relative">
                <input
                  id={id}
                  type="radio"
                  name="lead-priority"
                  value={value}
                  checked={priority === value}
                  onChange={() => setPriority(value)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className={cn(
                    "flex min-h-9 cursor-pointer items-center rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-muted-foreground transition-colors motion-reduce:transition-none",
                    "hover:border-primary/40 hover:text-foreground",
                    "peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground",
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                  )}
                >
                  {capitalize(value)}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* Follow-up */}
      <Field>
        <FieldLabel htmlFor="lead-followup">Follow-up</FieldLabel>
        <Input
          id="lead-followup"
          type="datetime-local"
          value={followUp}
          onChange={(event) => setFollowUp(event.target.value)}
        />

        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Quick follow-up times"
        >
          {followUpPresets.map((preset) => (
            <Button
              key={preset.days}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setFollowUp(daysFromNow(preset.days))}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!followUp}
            onClick={() => setFollowUp("")}
          >
            Clear
          </Button>
        </div>

        {isOverdue ? (
          <p role="status" className="text-sm font-medium text-destructive">
            This follow-up time has already passed.
          </p>
        ) : null}

        <FieldDescription>
          Leave empty to remove the follow-up. Times use your local time zone.
        </FieldDescription>
      </Field>

      {/* Actions */}
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <p
          role="status"
          aria-live="polite"
          className="text-sm text-muted-foreground"
        >
          {isDirty ? (
            <span className="font-medium text-foreground">
              You have unsaved changes
            </span>
          ) : (
            "All changes saved"
          )}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={onSave} disabled={saving || !isDirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            disabled={saving || !isDirty}
          >
            Reset
          </Button>
        </div>
      </div>
    </FieldGroup>
  );
}
