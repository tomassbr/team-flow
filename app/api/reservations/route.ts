import { prisma } from "@/lib/db";
import { requireAuth, requireCompany, getCompanyId } from "@/lib/tenant";
import {
  parseDateString,
  parseUUID,
  isFutureOrToday,
  toUtcMidnight,
} from "@/lib/validation";
import { rateLimitByIP, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const { searchParams } = new URL(request.url);
  const date = parseDateString(searchParams.get("date"));

  if (!date) {
    return Response.json(
      { error: "date query parameter is required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const companyId = getCompanyId(cs);

  const [reservations, desks] = await Promise.all([
    prisma.reservation.findMany({
      where: { companyId, date: toUtcMidnight(date) },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        deskId: true,
        userId: true,
        status: true,
        checkInAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.desk.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return Response.json({ reservations, desks });
}

export async function POST(request: Request) {
  const rl = rateLimitByIP(request, 10, 60_000);
  if (!rl.allowed) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  let body: { deskId?: unknown; date?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const deskId = parseUUID(body.deskId);
  if (!deskId) {
    return Response.json(
      { error: "deskId is required and must be a valid UUID" },
      { status: 400 }
    );
  }

  const date = parseDateString(body.date);
  if (!date) {
    return Response.json(
      { error: "date is required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  if (!isFutureOrToday(date)) {
    return Response.json(
      { error: "Cannot create a reservation for a past date" },
      { status: 422 }
    );
  }

  const companyId = getCompanyId(cs);
  const userId = cs.user.id;

  try {
    const reservation = await prisma.$transaction(async (tx) => {
      const desk = await tx.desk.findFirst({
        where: { id: deskId, companyId, isActive: true },
        select: { id: true },
      });

      if (!desk) throw new ReservationError("Desk not found", 404);

      const startOfDay = toUtcMidnight(date);

      const existingUser = await tx.reservation.findUnique({
        where: { userId_date: { userId, date: startOfDay } },
        select: { id: true },
      });

      if (existingUser) {
        throw new ReservationError("You already have a reservation for this date", 409);
      }

      const existingDesk = await tx.reservation.findUnique({
        where: { deskId_date: { deskId, date: startOfDay } },
        select: { id: true },
      });

      if (existingDesk) {
        throw new ReservationError("Desk is already reserved for this date", 409);
      }

      return tx.reservation.create({
        data: { companyId, userId, deskId, date: startOfDay, status: "RESERVED" },
        select: {
          id: true,
          deskId: true,
          userId: true,
          date: true,
          status: true,
          createdAt: true,
        },
      });
    });

    return Response.json(reservation, { status: 201 });
  } catch (err) {
    if (err instanceof ReservationError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    if (isPrismaUniqueConstraintError(err)) {
      const target = (err as { meta?: { target?: string[] } }).meta?.target ?? [];
      const message = target.includes("userId")
        ? "You already have a reservation for this date"
        : "Desk is already reserved for this date";
      return Response.json({ error: message }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(request: Request) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const { searchParams } = new URL(request.url);
  const reservationId = parseUUID(searchParams.get("id"));

  if (!reservationId) {
    return Response.json(
      { error: "id query parameter is required and must be a valid UUID" },
      { status: 400 }
    );
  }

  const companyId = getCompanyId(cs);
  const userId = cs.user.id;

  // deleteMany with userId and companyId ensures the user can only cancel their own
  // reservations and only within their company.
  const { count } = await prisma.reservation.deleteMany({
    where: { id: reservationId, userId, companyId },
  });

  if (count === 0) {
    return Response.json({ error: "Reservation not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class ReservationError extends Error {
  constructor(
    message: string,
    public readonly status: number
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
