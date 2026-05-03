import { prisma } from "@/lib/db";
import { requireAuth, requireCompany, requireRole, getCompanyId } from "@/lib/tenant";
import { parseName } from "@/lib/validation";
import { rateLimitByIP, rateLimitHeaders } from "@/lib/rate-limit";

const FREE_PLAN_MAX_DESKS = 10;
const FREE_PLAN_MAX_USERS = 20;

export async function GET() {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const company = await prisma.company.findUnique({
    where: { id: getCompanyId(cs) },
    select: {
      id: true,
      name: true,
      plan: true,
      maxDesks: true,
      maxUsers: true,
      primaryColor: true,
      logoUrl: true,
      createdAt: true,
    },
  });

  if (!company) {
    return Response.json({ error: "Company not found" }, { status: 404 });
  }

  return Response.json(company);
}

export async function POST(request: Request) {
  const rl = rateLimitByIP(request, 5, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const session = await requireAuth();
  if (session instanceof Response) return session;

  if (session.user.companyId) {
    return Response.json(
      { error: "User already belongs to a company" },
      { status: 409 }
    );
  }

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

  const company = await prisma.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        name,
        plan: "FREE",
        maxDesks: FREE_PLAN_MAX_DESKS,
        maxUsers: FREE_PLAN_MAX_USERS,
      },
    });

    await tx.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN", companyId: created.id },
    });

    return created;
  });

  // Signal the client to call update() on the session so JWT picks up the new companyId.
  return Response.json({ company, refreshSession: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const rl = rateLimitByIP(request, 20, 60_000);
  if (!rl.allowed) {
    return Response.json({ error: "Too many requests" }, { status: 429, headers: rateLimitHeaders(rl) });
  }

  const session = await requireAuth();
  if (session instanceof Response) return session;

  const cs = await requireCompany(session);
  if (cs instanceof Response) return cs;

  const roleErr = requireRole(cs, "ADMIN");
  if (roleErr) return roleErr;

  let body: { name?: unknown; primaryColor?: unknown };
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

  if (body.primaryColor !== undefined) {
    const color = typeof body.primaryColor === "string" ? body.primaryColor.trim() : null;
    if (!color || !/^#[0-9a-f]{6}$/i.test(color)) {
      return Response.json(
        { error: "primaryColor must be a valid hex color (#rrggbb)" },
        { status: 400 }
      );
    }
    updates.primaryColor = color;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const company = await prisma.company.update({
    where: { id: getCompanyId(cs) },
    data: updates,
    select: { id: true, name: true, plan: true, primaryColor: true, updatedAt: true },
  });

  return Response.json(company);
}
