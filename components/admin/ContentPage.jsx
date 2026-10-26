import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentManager } from "@/components/admin/ContentManager";
import { ReloadButton } from "@/components/admin/ReloadButton";
import { StatusOverview } from "@/components/admin/StatusOverview";
import { getContentConfig } from "@/config/admin-content";
import { requirePageAdmin } from "@/lib/auth/require-admin";
import { listContent } from "@/services/admin-content.service";

const DEFAULT_DESCRIPTION =
  "Create, edit, publish, or archive. Changes appear on your public site immediately.";

function countByStatus(items, status) {
  return items.filter((item) => item.status === status).length;
}

export async function ContentPage({ resource }) {
  const config = getContentConfig(resource);
  await requirePageAdmin(config.permission);

  let items = null;
  try {
    items = await listContent(config);
  } catch (error) {
    console.error(`[admin] failed to list ${resource}:`, error);
  }

  // Header details come from the real list, and only appear when it loaded.
  const published = items ? countByStatus(items, "published") : 0;
  const draft = items ? countByStatus(items, "draft") : 0;
  const archived = items ? countByStatus(items, "archived") : 0;
  const other = items ? items.length - published - draft - archived : 0;

  const meta = items
    ? [
        { label: "Total", value: items.length },
        { label: "Published", value: published },
        { label: "Draft", value: draft },
        { label: "Archived", value: archived },
      ]
    : undefined;

  const segments = items
    ? [
        {
          id: "published",
          label: "Published",
          value: published,
          className: "bg-primary",
        },
        {
          id: "draft",
          label: "Draft",
          value: draft,
          className: "bg-primary/40",
        },
        {
          id: "archived",
          label: "Archived",
          value: archived,
          className: "bg-muted-foreground/40",
        },
        // Agar kisi item ka status in teeno ke ilawa ho to wo bhi gino ma aaye
        ...(other > 0
          ? [
              {
                id: "other",
                label: "Other",
                value: other,
                className: "bg-border",
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={config.label}
        description={config.description ?? DEFAULT_DESCRIPTION}
        icon={config.icon}
        meta={meta}
      />

      {items ? (
        <>
          {items.length > 0 ? (
            <StatusOverview total={items.length} segments={segments} />
          ) : null}
          <ContentManager resource={resource} items={items} />
        </>
      ) : (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 flex max-w-2xl flex-col gap-3 rounded-xl border p-4 sm:p-5"
        >
          <div className="flex flex-col gap-1">
            <h2 className="text-foreground text-base font-semibold">
              Could not load {config.label.toLowerCase()}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your data could not be loaded, so nothing is shown here. Check
              your Firebase configuration, then reload the page. The technical
              details are in your server logs.
            </p>
          </div>
          <div>
            <ReloadButton />
          </div>
        </div>
      )}
    </div>
  );
}
