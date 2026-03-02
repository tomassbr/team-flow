import { prisma } from "@/lib/db";
import { requireAuth, requireCompany } from "@/lib/tenant";

export async function GET() {
  const session = await requireAuth();
  if (session instanceof Response) return session;
  const companySession = await requireCompany(session);
  if (companySession instanceof Response) return companySession;

  const companyId = companySession.user.companyId!;

  const desks = await prisma.desk.findMany({
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(desks);
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (session instanceof Response) return session;
  const companySession = await requireCompany(session);
  if (companySession instanceof Response) return companySession;

  const companyId = companySession.user.companyId!;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { maxDesks: true },
  });

  if (!company) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }

  const maxDesks = company.maxDesks ?? 0;
  const deskCount = await prisma.desk.count({ where: { companyId } });

  if (deskCount >= maxDesks) {
    return Response.json(
      { error: "Desk limit exceeded", maxDesks },
      { status: 403 }
    );
  }

  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const desk = await prisma.desk.create({
    data: { name, companyId },
  });

  return Response.json(desk);
}
