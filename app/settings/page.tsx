import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SettingsFormClient } from "@/components/dashboard/SettingsFormClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/onboarding");

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { id: true, name: true, plan: true, primaryColor: true },
  });

  if (!company) redirect("/onboarding");

  return (
    <SettingsFormClient
      company={{ ...company, plan: company.plan as "FREE" | "PRO" }}
    />
  );
}
