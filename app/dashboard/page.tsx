import { headers } from "next/headers";
import { auth } from "@/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DeskCard } from "@/components/ui/DeskCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { WorkspaceFilter } from "@/components/dashboard/WorkspaceFilter";
import { tokens } from "@/styles/tokens.config";

const MOCK_PEOPLE = [
  { name: "Sarah", initial: "S" },
  { name: "David", initial: "D" },
  { name: "Emma", initial: "E" },
  { name: "James", initial: "J" },
  { name: "Mia", initial: "M" },
];

const MOCK_DESKS = [
  { id: "1", name: "Window Spot 01", status: "available" as const },
  {
    id: "2",
    name: "Standing Desk A",
    status: "booked" as const,
    user: "David C.",
    duration: "Until 5 PM",
  },
  { id: "3", name: "Pod 03", status: "available" as const },
  {
    id: "4",
    name: "Corner Desk B",
    status: "booked" as const,
    user: "Emma W.",
    duration: "All Day",
  },
  { id: "5", name: "Quiet Zone 01", status: "available" as const },
];

const MOCK_WEEK = [
  { label: "Today", date: "Tue, 24 Oct", percent: 85 },
  { label: "Tomorrow", date: "Wed, 25 Oct", percent: 60 },
  { label: "Thursday", date: "Thu, 26 Oct", percent: 40 },
  { label: "Friday", date: "Fri, 27 Oct", percent: 20 },
];

function MonitorIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function EllipsisIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="18" r="1.5" />
    </svg>
  );
}

async function fetchDashboardData(date: string) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  try {
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

    if (!desksRes.ok || !reservationsRes.ok) {
      return {
        desks: MOCK_DESKS,
        reservations: [] as { deskId: string; userId: string }[],
        useMock: true,
        error: null,
      };
    }

    const desks = await desksRes.json();
    const { reservations } = await reservationsRes.json();
    return { desks, reservations, useMock: false, error: null };
  } catch (err) {
    return {
      desks: MOCK_DESKS,
      reservations: [] as { deskId: string; userId: string }[],
      useMock: true,
      error: err instanceof Error ? err.message : "Failed to load",
    };
  }
}

export default async function DashboardPage() {
  const today = new Date().toISOString().split("T")[0];
  const { desks, reservations, useMock, error } = await fetchDashboardData(today);

  const reservedDeskIds = new Set(
    reservations.map((r: { deskId: string }) => r.deskId)
  );

  const reservationByDesk = Object.fromEntries(
    reservations.map((r: { deskId: string; userId: string }) => [r.deskId, r])
  );

  const desksWithStatus = useMock
    ? MOCK_DESKS
    : desks.map((d: { id: string; name: string }) => {
        const res = reservationByDesk[d.id];
        return {
          ...d,
          status: res ? ("booked" as const) : ("available" as const),
          user: res ? `User ${res.userId.slice(0, 8)}` : undefined,
          duration: "All Day",
        };
      });

  return (
    <>
      {/* Left column — tokens: space/40, space/24 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s40,
          minWidth: 0,
        }}
      >
        {/* Who's In Today */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.s24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                color: tokens.color.text.primary,
                fontSize: tokens.type.h2,
                fontWeight: 500,
                letterSpacing: "-0.025em",
              }}
            >
              Who&apos;s In Today
            </h2>
            <span
              style={{
                color: tokens.color.text.muted,
                fontSize: tokens.type.micro,
              }}
            >
              12 People
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: tokens.space.s24,
              alignItems: "flex-end",
            }}
          >
            {MOCK_PEOPLE.map((p) => (
              <Avatar
                key={p.name}
                name={p.name}
                alt={p.name}
                size={56}
                badge={<MonitorIcon />}
              />
            ))}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: tokens.radius.full,
                background: tokens.color.surface.level2,
                border: `1px dashed ${tokens.color.border.strong}`,
                color: tokens.color.text.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: tokens.type.micro,
              }}
            >
              +7
            </div>
          </div>
        </section>

        {/* Workspace */}
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.s24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                color: tokens.color.text.primary,
                fontSize: tokens.type.h2,
                fontWeight: 500,
                letterSpacing: "-0.025em",
              }}
            >
              Workspace
            </h2>
            <WorkspaceFilter />
          </div>

          {error && (
            <div
              style={{
                padding: tokens.space.s16,
                background: tokens.color.status.error,
                color: tokens.color.text.onAccent,
                fontSize: tokens.type.caption,
                borderRadius: tokens.radius.r16,
              }}
            >
              {error}
            </div>
          )}

          {desksWithStatus.length === 0 ? (
            <div
              style={{
                padding: tokens.space.s32,
                textAlign: "center",
                color: tokens.color.text.muted,
                fontSize: tokens.type.body,
                background: tokens.color.surface.level1,
                borderRadius: tokens.radius.r20,
                boxShadow: tokens.shadow.e1,
              }}
            >
              No desks configured. Add desks in settings.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: tokens.space.s24,
              }}
            >
              {desksWithStatus.map((desk: { id: string; name: string; status: string; user?: string; duration?: string }) => (
                <DeskCard
                  key={desk.id}
                  name={desk.name}
                  status={desk.status as "available" | "booked"}
                  user={desk.user}
                  duration={desk.duration}
                />
              ))}
              <DeskCard
                name=""
                status="available"
                variant="addNew"
              />
            </div>
          )}
        </section>
      </div>

      {/* Right column — This Week */}
      <aside
        style={{
          width: 392,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s16,
        }}
      >
        <div
          style={{
            padding: tokens.space.s32,
            background: tokens.color.surface.level1,
            borderRadius: tokens.radius.r20,
            boxShadow: tokens.shadow.e1,
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.s24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h3
              style={{
                color: tokens.color.text.primary,
                fontSize: tokens.type.h2,
                fontWeight: 500,
              }}
            >
              This Week
            </h3>
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: tokens.color.text.muted,
                cursor: "pointer",
                padding: tokens.space.s8,
              }}
            >
              <EllipsisIcon />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space.s24,
            }}
          >
            {MOCK_WEEK.map((day) => (
              <div key={day.label} style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span
                      style={{
                        color: tokens.color.text.primary,
                        fontSize: tokens.type.body,
                        fontWeight: 500,
                      }}
                    >
                      {day.label}{" "}
                    </span>
                    <span
                      style={{
                        color: tokens.color.text.muted,
                        fontSize: tokens.type.micro,
                      }}
                    >
                      {day.date}
                    </span>
                  </div>
                  <span
                    style={{
                      color: tokens.color.text.primary,
                      fontSize: tokens.type.micro,
                      fontWeight: 500,
                    }}
                  >
                    {day.percent}% Full
                  </span>
                </div>
                <ProgressBar value={day.percent} />
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          icon={<CalendarIcon />}
          style={{ width: "100%", padding: `${tokens.space.s16} ${tokens.space.s24}` }}
        >
          Book Future Date
        </Button>
      </aside>
    </>
  );
}
