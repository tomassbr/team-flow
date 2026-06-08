import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Avatar } from "@/components/ui/Avatar";
import { DeskGridClient } from "@/components/dashboard/DeskGridClient";
import { tokens } from "@/styles/tokens.config";
import { MonitorIcon } from "@/components/icons";
import {
  getDashboardDesks,
  getDashboardReservations,
  getWeekOccupancy,
} from "@/lib/data/dashboard";
import type { DeskEntry } from "@/types/dashboard";
import type { UserSummary } from "@/types/domain";
import type { WeekDay } from "@/lib/data/dashboard";

// Mock data — used for visual preview when no real data exists
const MOCK_DESKS: DeskEntry[] = [
  { id: "mock-1", name: "Desk A1", status: "available" },
  { id: "mock-2", name: "Desk A2", status: "booked", user: "Alice Johnson", duration: "All Day" },
  { id: "mock-3", name: "Desk A3", status: "available" },
  { id: "mock-4", name: "Desk B1", status: "booked", user: "Bob Chen", duration: "All Day" },
  { id: "mock-5", name: "Desk B2", status: "available" },
  { id: "mock-6", name: "Desk B3", status: "booked", user: "Carol Smith", duration: "All Day" },
];

const MOCK_USERS: UserSummary[] = [
  { id: "u1", name: "Alice Johnson", image: null },
  { id: "u2", name: "Bob Chen", image: null },
  { id: "u3", name: "Carol Smith", image: null },
  { id: "u4", name: "David Park", image: null },
  { id: "u5", name: "Eva Martinez", image: null },
  { id: "u6", name: "Frank Lee", image: null },
];

const MOCK_WEEK_OCCUPANCY: WeekDay[] = [
  { date: new Date("2026-04-05"), label: "Today", dateLabel: "Sun, 5 Apr", percent: 50, reservationCount: 3 },
  { date: new Date("2026-04-06"), label: "Tomorrow", dateLabel: "Mon, 6 Apr", percent: 83, reservationCount: 5 },
  { date: new Date("2026-04-07"), label: "Tue", dateLabel: "Tue, 7 Apr", percent: 33, reservationCount: 2 },
  { date: new Date("2026-04-08"), label: "Wed", dateLabel: "Wed, 8 Apr", percent: 67, reservationCount: 4 },
  { date: new Date("2026-04-09"), label: "Thu", dateLabel: "Thu, 9 Apr", percent: 17, reservationCount: 1 },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.companyId) {
    redirect("/onboarding");
  }

  const { companyId } = session.user;
  const currentUserId = session.user.id;
  const today = new Date();

  const [desks, reservations] = await Promise.all([
    getDashboardDesks(companyId),
    getDashboardReservations(companyId, today),
  ]);

  const weekOccupancy = await getWeekOccupancy(companyId, desks.length, today);

  const reservationByDeskId = new Map(reservations.map((r) => [r.deskId, r]));

  const desksWithStatus: DeskEntry[] = desks.map((desk) => {
    const reservation = reservationByDeskId.get(desk.id);
    return {
      id: desk.id,
      name: desk.name,
      status: reservation ? ("booked" as const) : ("available" as const),
      user: reservation?.user.name ?? undefined,
      userId: reservation?.userId ?? undefined,
      reservationId: reservation?.id ?? undefined,
      duration: reservation ? "All Day" : undefined,
    };
  });

  const usersToday = reservations.map((r) => r.user);

  // Use mock data when no real data available (visual preview)
  const effectiveDesks = desksWithStatus.length > 0 ? desksWithStatus : MOCK_DESKS;
  const effectiveUsers = usersToday.length > 0 ? usersToday : MOCK_USERS;
  const effectiveWeekOccupancy =
    weekOccupancy.some((d) => d.percent > 0) ? weekOccupancy : MOCK_WEEK_OCCUPANCY;

  const visibleUsers = effectiveUsers.slice(0, 5);
  const overflowCount = Math.max(0, effectiveUsers.length - visibleUsers.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s40 }}>
      {/* Who's In Today */}
      <section style={{ display: "flex", flexDirection: "column", gap: tokens.space.s24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2
            style={{
              color: tokens.color.text.primary,
              fontSize: tokens.type.h2,
              fontWeight: 500,
              letterSpacing: "-0.025em",
              margin: 0,
            }}
          >
            Who&apos;s In Today
          </h2>
          {/* Glass pill count badge */}
          <div
            style={{
              padding: `${tokens.space.s4} ${tokens.space.s12}`,
              borderRadius: tokens.radius.full,
              background: "rgba(15,23,42,0.06)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <span
              style={{
                color: tokens.color.text.secondary,
                fontSize: tokens.type.micro,
                fontWeight: 500,
              }}
            >
              {effectiveUsers.length} {effectiveUsers.length === 1 ? "Person" : "People"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: tokens.space.s24, alignItems: "center" }}>
          {visibleUsers.map((user) => (
            <Avatar
              key={user.id}
              name={user.name ?? "?"}
              src={user.image}
              alt={user.name ?? "Team member"}
              size={56}
              badge={<span style={{ color: tokens.color.accent.secondary, display: "inline-flex" }}><MonitorIcon size={12} /></span>}
            />
          ))}
          {overflowCount > 0 && (
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.radius.full,
                background: "rgba(15,23,42,0.08)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.5)",
                color: tokens.color.text.secondary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: tokens.type.micro,
                fontWeight: 500,
              }}
            >
              +{overflowCount}
            </div>
          )}
        </div>
      </section>

      {/* Desk grid */}
      <DeskGridClient
        initialDesks={effectiveDesks}
        todayUsers={effectiveUsers}
        weekOccupancy={effectiveWeekOccupancy}
        isAdmin={session.user.role === "ADMIN"}
        currentUserId={currentUserId}
      />
    </div>
  );
}
