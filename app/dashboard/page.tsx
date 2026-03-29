import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { DeskCard } from "@/components/ui/DeskCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { WorkspaceFilter } from "@/components/dashboard/WorkspaceFilter";
import { tokens } from "@/styles/tokens.config";
import {
  getDashboardDesks,
  getDashboardReservations,
  getWeekOccupancy,
} from "@/lib/data/dashboard";

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

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.companyId) {
    redirect("/onboarding");
  }

  const { companyId } = session.user;
  const today = new Date();

  const [desks, reservations] = await Promise.all([
    getDashboardDesks(companyId),
    getDashboardReservations(companyId, today),
  ]);

  const weekOccupancy = await getWeekOccupancy(companyId, desks.length, today);

  const reservationByDeskId = new Map(reservations.map((r) => [r.deskId, r]));

  const desksWithStatus = desks.map((desk) => {
    const reservation = reservationByDeskId.get(desk.id);
    return {
      ...desk,
      status: reservation ? ("booked" as const) : ("available" as const),
      user: reservation?.user.name ?? undefined,
      duration: reservation ? "All Day" : undefined,
    };
  });

  const usersToday = reservations.map((r) => r.user);
  const visibleUsers = usersToday.slice(0, 5);
  const overflowCount = Math.max(0, usersToday.length - visibleUsers.length);

  return (
    <>
      {/* Left column */}
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
              {usersToday.length} {usersToday.length === 1 ? "Person" : "People"}
            </span>
          </div>

          {usersToday.length === 0 ? (
            <p
              style={{
                color: tokens.color.text.muted,
                fontSize: tokens.type.body,
              }}
            >
              No one has booked a desk yet today.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                gap: tokens.space.s24,
                alignItems: "flex-end",
              }}
            >
              {visibleUsers.map((user) => (
                <Avatar
                  key={user.id}
                  name={user.name ?? "?"}
                  src={user.image}
                  alt={user.name ?? "Team member"}
                  size={56}
                  badge={<MonitorIcon />}
                />
              ))}
              {overflowCount > 0 && (
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
                  +{overflowCount}
                </div>
              )}
            </div>
          )}
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
              No desks configured. Add desks in admin settings.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: tokens.space.s24,
              }}
            >
              {desksWithStatus.map((desk) => (
                <DeskCard
                  key={desk.id}
                  name={desk.name}
                  status={desk.status}
                  user={desk.user}
                  duration={desk.duration}
                />
              ))}
              <DeskCard name="" status="available" variant="addNew" />
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
          overflow: "visible",
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
            {weekOccupancy.map((day) => (
              <div
                key={day.date.toISOString()}
                style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}
              >
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
                      {day.dateLabel}
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

          <Button
            variant="gradient"
            icon={<CalendarIcon />}
            style={{
              width: "100%",
              padding: `${tokens.space.s16} ${tokens.space.s24}`,
              marginTop: tokens.space.s12,
            }}
          >
            Book Future Date
          </Button>
        </div>
      </aside>
    </>
  );
}
