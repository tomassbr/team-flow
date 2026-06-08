import { prisma } from "@/lib/db";

export interface UserReservation {
  id: string;
  date: Date;
  status: "RESERVED" | "CONFIRMED" | "RELEASED";
  desk: {
    id: string;
    name: string;
  };
}

/**
 * Fetch all reservations for a user within a company, sorted by date ascending.
 */
export async function getUserReservations(
  companyId: string,
  userId: string
): Promise<UserReservation[]> {
  const rows = await prisma.reservation.findMany({
    where: { companyId, userId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      status: true,
      desk: { select: { id: true, name: true } },
    },
  });

  return rows.map((r) => ({
    ...r,
    status: r.status as UserReservation["status"],
  }));
}
