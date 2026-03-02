import { prisma } from "@/lib/db";
import { requireAuth, requireCompany } from "@/lib/tenant";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof Response) return session;
  const companySession = await requireCompany(session);
  if (companySession instanceof Response) return companySession;

  const companyId = companySession.user.companyId!;
  const { id } = await params;

  const desk = await prisma.desk.findFirst({
    where: { id, companyId },
  });

  if (!desk) {
    return Response.json({ error: "Desk not found" }, { status: 404 });
  }

  await prisma.desk.delete({
    where: { id },
  });

  return new Response(null, { status: 204 });
}
