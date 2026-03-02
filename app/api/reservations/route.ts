import { prisma } from "@/lib/db";
import { requireAuth, requireCompany } from "@/lib/tenant";

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  return Response.json({});
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (session instanceof Response) return session;
  const companySession = await requireCompany(session);
  if (companySession instanceof Response) return companySession;

  const companyId = companySession.user.companyId!;
  const userId = companySession.user.id;

  let body: { deskId?: string; date?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const deskId = body.deskId?.trim();
  if (!deskId) {
    return Response.json({ error: "deskId is required" }, { status: 400 });
  }

  const date = parseDate(body.date);
  if (!date) {
    return Response.json(
      { error: "date is required (ISO format: YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const desk = await tx.desk.findFirst({
        where: { id: deskId, companyId },
      });

      if (!desk) {
        throw new ReservationError("Desk not found", 404);
      }

      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const existingUserReservation = await tx.reservation.findUnique({
        where: {
          userId_date: {
            userId,
            date: startOfDay,
          },
        },
      });

      if (existingUserReservation) {
        throw new ReservationError(
          "You already have a reservation for this date",
          409
        );
      }

      const existingDeskReservation = await tx.reservation.findUnique({
        where: {
          deskId_date: {
            deskId,
            date: startOfDay,
          },
        },
      });

      if (existingDeskReservation) {
        throw new ReservationError("Desk is already reserved for this date", 409);
      }

      return tx.reservation.create({
        data: {
          companyId,
          userId,
          deskId,
          date: startOfDay,
          status: "RESERVED",
        },
      });
    });

    return Response.json(reservation);
  } catch (err) {
    if (err instanceof ReservationError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    if (isPrismaUniqueConstraintError(err)) {
      return Response.json(
        { error: "Reservation conflict (desk or user already reserved for this date)" },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE() {
  return Response.json({});
}

class ReservationError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ReservationError";
  }
}

function isPrismaUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  );
}
