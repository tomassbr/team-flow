import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.companyId) redirect("/onboarding");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AppLayout
      userName={session.user.name ?? "User"}
      userRole="Admin"
      userImage={session.user.image ?? null}
      variant="admin-page"
    >
      {children}
    </AppLayout>
  );
}
