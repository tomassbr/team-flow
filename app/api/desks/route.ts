import { prisma } from "@/lib/db";
import { requireAuth, requireCompany, requireRole, getCompanyId } from "@/lib/tenant";
import { parseName } from "@/lib/validation";
import { rateLimitByIP, rateLimitHeaders } from "@/lib/rate-limit";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const desks = await prisma.desk.findMany({
    where: { companyId: getCompanyId(cs) },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, isActive: true, createdAt: true, updatedAt: true },
  });

  return Response.json(desks);
}

export async function POST(request: Request) {
  const rl = rateLimitByIP(request, 20, 60_000);
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

  const roleErr = requireRole(cs, "ADMIN");
  if (roleErr) return roleErr;

  let body: { name?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = parseName(body.name);
  if (!name) {
    return Response.json(
      { error: "name is required (max 100 characters)" },
      { status: 400 }
    );
  }

  const companyId = getCompanyId(cs);

  // Atomically check the desk limit and create the desk to prevent race conditions.
  const desk = await prisma.$transaction(async (tx) => {
    const company = await tx.company.findUnique({
      where: { id: companyId },
      select: { maxDesks: true },
    });

    if (!company) throw new DeskError("Company not found", 404);

    const maxDesks = company.maxDesks ?? 0;
    const deskCount = await tx.desk.count({ where: { companyId } });

    if (deskCount >= maxDesks) {
      throw new DeskError(`Desk limit reached (max ${maxDesks})`, 403);
    }

    return tx.desk.create({
      data: { name, companyId },
      select: { id: true, name: true, isActive: true, createdAt: true },
    });
  });

  return Response.json(desk, { status: 201 });
}

class DeskError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "DeskError";
  }
}
