import { prisma } from "@/lib/db";
import { requireAuth, requireCompany, requireRole, getCompanyId } from "@/lib/tenant";
import { parseName, parseUUID } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const roleErr = requireRole(cs, "ADMIN");
  if (roleErr) return roleErr;

  const { id } = await params;
  if (!parseUUID(id)) {
    return Response.json({ error: "Invalid desk id" }, { status: 400 });
  }

  let body: { name?: unknown; isActive?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = parseName(body.name);
    if (!name) {
      return Response.json(
        { error: "name must be 1–100 characters" },
        { status: 400 }
      );
    }
    updates.name = name;
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== "boolean") {
      return Response.json({ error: "isActive must be a boolean" }, { status: 400 });
    }
    updates.isActive = body.isActive;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const companyId = getCompanyId(cs);

  // Use updateMany with companyId filter — acts as a combined existence + ownership check.
  const { count } = await prisma.desk.updateMany({
    where: { id, companyId },
    data: updates,
  });

  if (count === 0) {
    return Response.json({ error: "Desk not found" }, { status: 404 });
  }

  const desk = await prisma.desk.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true, updatedAt: true },
  });

  return Response.json(desk);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const roleErr = requireRole(cs, "ADMIN");
  if (roleErr) return roleErr;

  const { id } = await params;
  if (!parseUUID(id)) {
    return Response.json({ error: "Invalid desk id" }, { status: 400 });
  }

  const companyId = getCompanyId(cs);

  // deleteMany with companyId is a single atomic operation — no separate findFirst needed.
  const { count } = await prisma.desk.deleteMany({
    where: { id, companyId },
  });

  if (count === 0) {
    return Response.json({ error: "Desk not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
