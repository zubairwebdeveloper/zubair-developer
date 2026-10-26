"use client";

import { Loader2, Search, ShieldCheck, UserPlus, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SelectField, TextField } from "@/components/forms/shared/fields";
import { FormError } from "@/components/forms/shared/FormStatus";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createResolver } from "@/lib/admin/form-payload";
import { ROLES } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
import { formatDateTime } from "@/lib/utils/dates";
import { sendJson } from "@/lib/utils/submit-form";
import { teamInviteSchema } from "@/lib/validations/admin.schema";

const roleOptions = Object.values(ROLES).map((value) => ({
  value,
  label: value,
}));

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
];

function getInitials(member) {
  const source = (member.displayName || member.email || "?").trim();
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (
    (parts[0]?.[0] ?? "?") + (parts.length > 1 ? (parts[1]?.[0] ?? "") : "")
  ).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Invite dialog                                                             */
/* -------------------------------------------------------------------------- */

function InviteDialog({ open, onOpenChange }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    resolver: createResolver(teamInviteSchema, (values) => values),
    defaultValues: { email: "", name: "", role: "SALES" },
  });

  function handleOpenChange(next) {
    if (!next) {
      reset();
      setSubmitError("");
    }
    onOpenChange(next);
  }

  async function onSubmit(values) {
    setSubmitError("");
    try {
      const result = await sendJson("POST", "/api/admin/team", values);
      toast.success(
        result.created
          ? "Account created. Ask them to use 'Forgot password?' on the login page to set a password."
          : "Existing account added to the team.",
      );
      handleOpenChange(false);
      router.refresh();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>
            The role decides what they can see and change.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <TextField
              control={control}
              name="email"
              label="Email"
              type="email"
              autoComplete="off"
            />
            <TextField
              control={control}
              name="name"
              label="Name (optional)"
              autoComplete="off"
            />
            <SelectField
              control={control}
              name="role"
              label="Role"
              options={roleOptions}
            />
            <FormError message={submitError} />
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="size-4 motion-safe:animate-spin"
                    aria-hidden="true"
                  />
                  Adding…
                </>
              ) : (
                <>
                  <UserPlus className="size-4" aria-hidden="true" />
                  Add member
                </>
              )}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Row pieces (table aur mobile cards dono mein share hote hain)             */
/* -------------------------------------------------------------------------- */

function MemberIdentity({ member, isSelf }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden="true"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold text-primary"
      >
        {getInitials(member)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium">
          {member.displayName ?? member.email}
          {isSelf ? (
            <span className="ml-1.5 rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              you
            </span>
          ) : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
    </div>
  );
}

function RoleControl({ member, isSelf, busy, onChange, className }) {
  if (isSelf) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        {member.role}
      </span>
    );
  }

  return (
    <Select
      value={member.role}
      disabled={busy}
      onValueChange={(role) => onChange(member, { role }, "Role updated")}
    >
      <SelectTrigger
        aria-label={`Role for ${member.email}`}
        className={cn("w-40", className)}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MemberActions({ member, isSelf, busy, onEnable, onDisable }) {
  if (isSelf) return null;

  if (member.status === "active") {
    return (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy}
        aria-label={`Disable ${member.email}`}
        onClick={() => onDisable(member)}
        className="text-muted-foreground hover:text-destructive"
      >
        Disable
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={busy}
      aria-label={`Enable ${member.email}`}
      onClick={onEnable}
      className="gap-1.5 hover:border-primary/40 hover:bg-primary/10"
    >
      {busy ? (
        <Loader2
          className="size-4 motion-safe:animate-spin"
          aria-hidden="true"
        />
      ) : null}
      Enable
    </Button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export function TeamManager({ members, currentUid }) {
  const router = useRouter();
  const [inviting, setInviting] = useState(false);
  const [disabling, setDisabling] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  async function update(member, patch, message) {
    setBusyId(member.id);
    try {
      await sendJson("PATCH", `/api/admin/team/${member.id}`, patch);
      toast.success(message);
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusyId(null);
      setDisabling(null);
    }
  }

  const counts = useMemo(() => {
    const active = members.filter((m) => m.status === "active").length;
    return { total: members.length, active, disabled: members.length - active };
  }, [members]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return members.filter((member) => {
      if (filter === "active" && member.status !== "active") return false;
      if (filter === "disabled" && member.status === "active") return false;
      if (!term) return true;
      return (
        member.email?.toLowerCase().includes(term) ||
        member.displayName?.toLowerCase().includes(term)
      );
    });
  }, [members, query, filter]);

  const filtering = query.trim() !== "" || filter !== "all";

  function clearFilters() {
    setQuery("");
    setFilter("all");
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-md">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Disabled" value={counts.disabled} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <label htmlFor="team-search" className="sr-only">
              Search team members
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="team-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
              className="h-10 pr-10 pl-9"
            />
            {query ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-1 size-8 -translate-y-1/2 text-muted-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>

          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex rounded-lg border border-border/70 bg-muted/30 p-0.5"
          >
            {FILTERS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={filter === option.value ? "secondary" : "ghost"}
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
                className="h-8 px-3"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setInviting(true)}
          className="gap-2 motion-safe:active:scale-[0.98]"
        >
          <UserPlus className="size-4" aria-hidden="true" />
          Add team member
        </Button>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {filtering
          ? `Showing ${visible.length} of ${members.length} members`
          : `${members.length} ${members.length === 1 ? "member" : "members"}`}
      </p>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-14 text-center">
          <Users className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            {filtering
              ? "No team members match your filters."
              : "No team members yet."}
          </p>
          {filtering ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={() => setInviting(true)}>
              Add your first member
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <ul className="flex flex-col gap-3 md:hidden">
            {visible.map((member) => {
              const isSelf = member.id === currentUid;
              const busy = busyId === member.id;
              return (
                <li
                  key={member.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <MemberIdentity member={member} isSelf={isSelf} />
                    <StatusBadge status={member.status} />
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Role</dt>
                      <dd className="mt-1">
                        <RoleControl
                          member={member}
                          isSelf={isSelf}
                          busy={busy}
                          onChange={update}
                          className="w-full"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Last login
                      </dt>
                      <dd className="mt-1">
                        {formatDateTime(member.lastLoginAt)}
                      </dd>
                    </div>
                  </dl>
                  {isSelf ? null : (
                    <div className="flex justify-end border-t border-border/70 pt-3">
                      <MemberActions
                        member={member}
                        isSelf={isSelf}
                        busy={busy}
                        onDisable={setDisabling}
                        onEnable={() =>
                          update(member, { status: "active" }, "Member enabled")
                        }
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden rounded-xl border border-border/70 bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((member) => {
                  const isSelf = member.id === currentUid;
                  const busy = busyId === member.id;
                  return (
                    <TableRow
                      key={member.id}
                      className={cn(
                        "transition-colors",
                        member.status !== "active" && "opacity-75",
                      )}
                    >
                      <TableCell>
                        <MemberIdentity member={member} isSelf={isSelf} />
                      </TableCell>
                      <TableCell>
                        <RoleControl
                          member={member}
                          isSelf={isSelf}
                          busy={busy}
                          onChange={update}
                        />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={member.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(member.lastLoginAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <MemberActions
                          member={member}
                          isSelf={isSelf}
                          busy={busy}
                          onDisable={setDisabling}
                          onEnable={() =>
                            update(
                              member,
                              { status: "active" },
                              "Member enabled",
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <InviteDialog open={inviting} onOpenChange={setInviting} />

      <ConfirmDialog
        open={disabling !== null}
        onOpenChange={(open) => !open && setDisabling(null)}
        title="Disable this member?"
        description="Their admin access ends immediately and they will be signed out. You can enable them again later."
        confirmLabel="Disable"
        destructive
        pending={busyId !== null}
        onConfirm={() =>
          update(disabling, { status: "disabled" }, "Member disabled")
        }
      />
    </div>
  );
}
