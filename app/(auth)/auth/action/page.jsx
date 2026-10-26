import { ActionHandler } from "@/components/auth/ActionHandler";

export const metadata = { title: "Account action" };

export default async function ActionPage({ searchParams }) {
  const { mode, oobCode } = await searchParams;

  return (
    <ActionHandler
      mode={typeof mode === "string" ? mode : ""}
      code={typeof oobCode === "string" ? oobCode : ""}
    />
  );
}
