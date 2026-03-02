import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/tenant";

const FREE_PLAN_MAX_DESKS = 10;
const FREE_PLAN_MAX_USERS = 20;

export async function GET() {
  return Response.json({});
}

export async function POST(request: Request) {
  const session = await requireAuth();
  if (session instanceof Response) return session;

  if (session.user.companyId) {
    return Response.json(
      { error: "User already belongs to a company" },
      { status: 409 }
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
      data: {
        role: "ADMIN",
        companyId: created.id,
      },
    });

    return created;
  });

  return Response.json(company);
}

export async function PATCH() {
  return Response.json({});
}
