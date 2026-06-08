import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layouts/AppLayout";

export default async function ReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!session.user.companyId) redirect("/onboarding");

  const userName = session.user.name ?? "User";
  const userRole: "Admin" | "Member" = session.user.role === "ADMIN" ? "Admin" : "Member";
  const userImage = session.user.image ?? null;

  return (
    <AppLayout userName={userName} userRole={userRole} userImage={userImage}>
      {children}
    </AppLayout>
  );
}
