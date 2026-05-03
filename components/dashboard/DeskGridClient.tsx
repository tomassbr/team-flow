"use client";

import { useState } from "react";
import { DeskCard } from "@/components/ui/DeskCard";
import { ReservationDrawer } from "@/components/ui/ReservationDrawer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, EllipsisIcon } from "@/components/icons";
import { tokens } from "@/styles/tokens.config";
import type { DeskWithStatus, UserSummary } from "@/types/domain";
import type { WeekDay } from "@/lib/data/dashboard";

type FilterValue = "all" | "available";

const FILTER_OPTIONS = [
  { value: "all" as FilterValue, label: "All" },
  { value: "available" as FilterValue, label: "Available" },
];

interface DeskGridClientProps {
  desks: DeskWithStatus[];
  todayUsers: UserSummary[];
  weekOccupancy: WeekDay[];
  isAdmin: boolean;
}

export function DeskGridClient({ desks, todayUsers, weekOccupancy, isAdmin }: DeskGridClientProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedDesk, setSelectedDesk] = useState<{ id: string; name: string } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visibleDesks = filter === "available" ? desks.filter((d) => d.status === "available") : desks;

  function handleDeskClick(desk: DeskWithStatus) {
    setSelectedDesk((prev) => (prev?.id === desk.id ? null : { id: desk.id, name: desk.name }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: tokens.space.s40, alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.space.s24 }}>
          <h2
            style={{
              fontSize: tokens.type.h2,
              fontWeight: 500,
              color: tokens.color.text.primary,
              letterSpacing: "-0.025em",
            }}
          >
            Workspace
          </h2>
          <SegmentedControl
            options={FILTER_OPTIONS}
            value={filter}
            onChange={(v) => setFilter(v as FilterValue)}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: tokens.space.s24,
          }}
        >
          {visibleDesks.map((desk) => (
            <DeskCard
              key={desk.id}
              name={desk.name}
              status={desk.status}
              user={desk.user}
              duration={desk.duration}
              isSelected={selectedDesk?.id === desk.id}
              onClick={desk.status === "available" ? () => handleDeskClick(desk) : undefined}
            />
          ))}
          {isAdmin && filter === "all" && <DeskCard name="" status="available" variant="addNew" />}
        </div>
      </div>

      <div style={{ width: 392, flexShrink: 0 }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s24 }}>
            {weekOccupancy.map((day, index) => (
              <div
                key={day.dateLabel}
                style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: tokens.color.text.primary, fontSize: tokens.type.body, fontWeight: 500 }}>
                      {day.label}{" "}
                    </span>
                    <span style={{ color: tokens.color.text.muted, fontSize: tokens.type.micro }}>
                      {day.dateLabel}
                    </span>
                  </div>
                  <span
                    style={
                      index === 0
                        ? {
                            background: `linear-gradient(to right, ${tokens.color.accent.primary}, ${tokens.color.accent.secondary})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: tokens.type.micro,
                            fontWeight: 500,
                          }
                        : {
                            color: tokens.color.text.secondary,
                            fontSize: tokens.type.micro,
                            fontWeight: 500,
                          }
                    }
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
            fullWidth
            icon={<CalendarIcon />}
            disabled={!selectedDesk}
            onClick={() => setDrawerOpen(true)}
            style={{ marginTop: tokens.space.s12 }}
          >
            Book Future Date
          </Button>
        </div>
      </div>

      {drawerOpen && selectedDesk && (
        <ReservationDrawer
          desk={selectedDesk}
          todayUsers={todayUsers}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedDesk(null);
          }}
        />
      )}
    </div>
  );
}
