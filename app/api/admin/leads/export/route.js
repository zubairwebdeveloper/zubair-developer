import { guardAdminRequest } from "@/lib/auth/guard";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { handleRouteError } from "@/lib/security/route-errors";
import { toCsv } from "@/lib/utils/csv";
import { exportLeads } from "@/services/leads.service";

const columns = [
  { key: "reference", label: "Reference" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "businessType", label: "Business type" },
  { key: "service", label: "Service" },
  { key: "planSlug", label: "Plan" },
  { key: "budget", label: "Budget" },
  { key: "timeline", label: "Timeline" },
  { key: "contactMethod", label: "Contact method" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "source", label: "Source" },
  { key: "followUpAt", label: "Follow-up" },
  { key: "createdAt", label: "Created" },
];

export async function GET(request) {
  const guard = await guardAdminRequest(request, PERMISSIONS.LEADS_READ);
  if (guard.response) return guard.response;

  try {
    const leads = await exportLeads(guard.admin);
    const csv = `\uFEFF${toCsv(columns, leads)}`;
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return handleRouteError(error, "admin/leads:export");
  }
}
