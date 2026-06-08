import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { tokens } from "@/styles/tokens.config";
import { getUserReservations } from "@/lib/data/reservations";
import { getDashboardDesks, getWeekOccupancy } from "@/lib/data/dashboard";
import { ReservationsClient } from "@/components/dashboard/ReservationsClient";

export default async function ReservationsPage() {
  const session = await auth();

  if (!session?.user?.companyId) redirect("/onboarding");

  const { companyId } = session.user;
  const userId = session.user.id;
  const today = new Date();

  const [reservations, desks] = await Promise.all([
    getUserReservations(companyId, userId),
    getDashboardDesks(companyId),
  ]);

  const weekOccupancy = await getWeekOccupancy(companyId, desks.length, today);

  // Serialize dates for client transport
  const serialized = reservations.map((r) => ({
    id: r.id,
    date: r.date.toISOString().split("T")[0] as string,
    status: r.status,
    desk: r.desk,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s32 }}>
      <h1
        style={{
          fontSize: tokens.type.h1,
          fontWeight: 500,
          color: tokens.color.text.primary,
          letterSpacing: "-0.025em",
          margin: 0,
        }}
      >
        My Reservations
      </h1>

      <ReservationsClient reservations={serialized} weekOccupancy={weekOccupancy} />
    </div>
  );
}
