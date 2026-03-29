import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.companyId) redirect("/onboarding");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const userName = session.user.name ?? "User";

  return (
    <AdminLayout userName={userName} userRole="Admin">
      {children}
    </AdminLayout>
  );
}
