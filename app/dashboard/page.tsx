import { headers } from "next/headers";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Grid } from "@/components/ui/Grid";
import { Input } from "@/components/ui/Input";

async function fetchDashboardData(date: string) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const [desksRes, reservationsRes] = await Promise.all([
    fetch(`${baseUrl}/api/desks`, {
      headers: { cookie },
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/reservations?date=${date}`, {
      headers: { cookie },
      cache: "no-store",
    }),
  ]);

  if (!desksRes.ok) return { desks: [], reservations: [], error: true };
  if (!reservationsRes.ok) return { desks: [], reservations: [], error: true };

  const desks = await desksRes.json();
  const { reservations } = await reservationsRes.json();

  return { desks, reservations };
}

export default async function DashboardPage() {
  const session = await auth();
  const today = new Date().toISOString().split("T")[0];
  const { desks, reservations } = await fetchDashboardData(today);

  const reservedDeskIds = new Set(
    reservations.map((r: { deskId: string }) => r.deskId)
  );

  const desksWithStatus = desks.map(
    (desk: { id: string; name: string }) => ({
      id: desk.id,
      name: desk.name,
      status: reservedDeskIds.has(desk.id) ? "reserved" : "available",
    })
  );

  const userReservation = session?.user?.id
    ? reservations.find(
        (r: { userId: string }) => r.userId === session.user.id
      )
    : null;

  const deskNameById = Object.fromEntries(
    desks.map((d: { id: string; name: string }) => [d.id, d.name])
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            Desk Availability
          </h1>
          <div className="flex items-center gap-4">
            <Input placeholder="Select date" className="w-40" />
            <Button>Book desk</Button>
          </div>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desk grid */}
          <section className="flex-1">
            <h2 className="mb-4 text-lg font-medium text-foreground">
              Available desks
            </h2>
            <Grid cols={3}>
              {desksWithStatus.map((desk: { id: string; name: string; status: string }) => (
                <Card key={desk.id}>
                  <div className="flex flex-col gap-2">
                    <span className="font-medium text-foreground">
                      {desk.name}
                    </span>
                    <span
                      className={`text-sm ${
                        desk.status === "available"
                          ? "text-success"
                          : "text-foreground-muted"
                      }`}
                    >
                      {desk.status === "available" ? "Available" : "Reserved"}
                    </span>
                  </div>
                </Card>
              ))}
            </Grid>
          </section>

          {/* Reservation summary */}
          <aside className="w-full lg:w-80">
            <Card className="sticky top-6">
              <h2 className="mb-4 text-lg font-medium text-foreground">
                Your reservation
              </h2>
              <div className="space-y-2 text-sm text-foreground-muted">
                {userReservation ? (
                  <p>
                    {deskNameById[userReservation.deskId] ?? "Desk"} reserved
                    for {today}.
                  </p>
                ) : (
                  <>
                    <p>No reservation for selected date.</p>
                    <p className="pt-4">Select a desk and date to book.</p>
                  </>
                )}
              </div>
              <div className="mt-6">
                <Button className="w-full">Book desk</Button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
