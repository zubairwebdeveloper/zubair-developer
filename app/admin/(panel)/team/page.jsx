import { ShieldCheck, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { TeamManager } from "@/components/admin/TeamManager";
import { Reveal } from "@/components/shared/Reveal";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { listTeam } from "@/services/team.service";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const admin = await requirePageAdmin(PERMISSIONS.TEAM_MANAGE);

  let members = null;
  try {
    members = await listTeam();
  } catch (error) {
    console.error("[admin] failed to list team:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Team"
        description="Only a SUPER_ADMIN can manage the team."
      />

      {members ? (
        <>
          <p
            className="text-muted-foreground inline-flex items-center gap-2 text-sm"
            role="status"
          >
            <Users aria-hidden="true" className="size-4" />
            <span className="text-foreground font-medium tabular-nums">
              {members.length}
            </span>
            {members.length === 1 ? "team member" : "team members"}
          </p>

          <Reveal direction="up">
            <TeamManager members={members} currentUid={admin.uid} />
          </Reveal>

          <div className="border-border bg-muted/40 flex items-start gap-3 rounded-xl border p-4 text-sm">
            <ShieldCheck
              aria-hidden="true"
              className="text-primary mt-0.5 size-4 shrink-0"
            />
            <p className="text-muted-foreground leading-6">
              Team members can access the admin area. Give access only to people
              who need it. Changes are recorded in the audit log.
            </p>
          </div>
        </>
      ) : (
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex max-w-2xl flex-col items-start gap-3 rounded-2xl border p-5"
        >
          <p className="text-destructive font-medium">
            Could not load the team.
          </p>
          <p className="text-muted-foreground text-sm leading-6">
            The team list could not be loaded, so nothing is shown here. Reload
            the page. The technical details are in your server logs.
          </p>
          <ReloadButton />
        </div>
      )}
    </div>
  );
}
