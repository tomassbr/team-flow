import { prisma } from "@/lib/db";
import { requireAuth, requireCompany, getCompanyId } from "@/lib/tenant";

export interface MyReservation {
  id: string;
  date: string; // ISO date "YYYY-MM-DD"
  status: "RESERVED" | "CONFIRMED" | "RELEASED";
  desk: {
    id: string;
    name: string;
  };
}

export async function GET() {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const companyId = getCompanyId(cs);
  const userId = cs.user.id;

  const reservations = await prisma.reservation.findMany({
    where: { companyId, userId },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      status: true,
      desk: { select: { id: true, name: true } },
    },
  });

  // Serialize dates to ISO strings for JSON transport
  const payload: MyReservation[] = reservations.map((r) => ({
    id: r.id,
    date: r.date.toISOString().split("T")[0] as string,
    status: r.status as MyReservation["status"],
    desk: r.desk,
  }));

  return Response.json(payload);
}
