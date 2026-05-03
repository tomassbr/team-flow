import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { DeskManagementClient } from "@/components/dashboard/DeskManagementClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.companyId) redirect("/onboarding");

  const { companyId } = session.user;

  const [desks, company] = await Promise.all([
    prisma.desk.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, isActive: true, qrToken: true },
    }),
    prisma.company.findUnique({
      where: { id: companyId },
      select: { maxDesks: true },
    }),
  ]);

  return (
    <DeskManagementClient
      initialDesks={desks}
      maxDesks={company?.maxDesks ?? null}
    />
  );
}
