import { AdminShell } from "@/components/admin/AdminShell";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePageAdmin } from "@/lib/auth/require-admin";

export default async function AdminPanelLayout({ children }) {
  const admin = await requirePageAdmin(PERMISSIONS.DASHBOARD_VIEW);

  return (
    <AdminShell
      admin={{
        uid: admin.uid,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }}
    >
      {children}
    </AdminShell>
  );
}
