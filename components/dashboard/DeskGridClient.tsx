"use client";

import { useState, useCallback } from "react";
import { DeskCard } from "@/components/ui/DeskCard";
import { ReservationDrawer } from "@/components/ui/ReservationDrawer";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { CalendarIcon, EllipsisIcon, ArrowRightIcon } from "@/components/icons";
import { cancelReservation } from "@/lib/api/reservations";
import { tokens } from "@/styles/tokens.config";
import { toLocalDateString, addDays } from "@/lib/utils/date";
import type { DeskEntry } from "@/types/dashboard";
import type { UserSummary } from "@/types/domain";
import type { WeekDay } from "@/lib/data/dashboard";
import Link from "next/link";

type FilterValue = "all" | "available";

const FILTER_OPTIONS = [
  { value: "all" as FilterValue, label: "All" },
  { value: "available" as FilterValue, label: "Available" },
];

// Types matching the GET /api/reservations response
interface ApiReservation {
  id: string;
  deskId: string;
  userId: string;
  status: string;
  user: { id: string; name: string | null; image: string | null };
}
interface ApiDesk {
  id: string;
  name: string;
}

interface DeskGridClientProps {
  initialDesks: DeskEntry[];
  todayUsers: UserSummary[];
  weekOccupancy: WeekDay[];
  isAdmin: boolean;
  currentUserId: string;
}

export function DeskGridClient({
  initialDesks,
  todayUsers,
  weekOccupancy,
  isAdmin,
  currentUserId,
}: DeskGridClientProps) {
  const today = new Date();
  const tomorrow = addDays(today, 1);
  const todayStr = toLocalDateString(today);
  const tomorrowStr = toLocalDateString(tomorrow);

  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [customDateStr, setCustomDateStr] = useState("");
  const [desks, setDesks] = useState<DeskEntry[]>(initialDesks);
  const [loading, setLoading] = useState(false);
  const [drawerDesk, setDrawerDesk] = useState<{ id: string; name: string } | null>(null);

  const dateStr = toLocalDateString(selectedDate);
  const isToday = dateStr === todayStr;
  const isTomorrow = dateStr === tomorrowStr;

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchDesksForDate = useCallback(async (date: Date) => {
    const str = toLocalDateString(date);
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations?date=${str}`);
      if (!res.ok) return;
      const data: { reservations: ApiReservation[]; desks: ApiDesk[] } = await res.json();
      const resMap = new Map(data.reservations.map((r) => [r.deskId, r]));
      setDesks(
        data.desks.map((d) => {
          const r = resMap.get(d.id);
          return {
            id: d.id,
            name: d.name,
            status: r ? ("booked" as const) : ("available" as const),
            user: r?.user.name ?? undefined,
            userId: r?.userId,
            reservationId: r?.id,
            duration: r ? "All Day" : undefined,
          };
        })
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Date selection ─────────────────────────────────────────────────────────

  async function handleDateSelect(date: Date, customStr = "") {
    setSelectedDate(date);
    setCustomDateStr(customStr);
    await fetchDesksForDate(date);
  }

  // ─── Booking ────────────────────────────────────────────────────────────────

  function handleDeskClick(desk: DeskEntry) {
    if (desk.status === "available") {
      setDrawerDesk({ id: desk.id, name: desk.name });
    }
  }

  async function handleBookingSuccess() {
    await fetchDesksForDate(selectedDate);
  }

  // ─── Cancel ─────────────────────────────────────────────────────────────────

  async function handleCancelReservation(desk: DeskEntry) {
    if (!desk.reservationId) return;
    try {
      await cancelReservation(desk.reservationId);
      // Optimistic update
      setDesks((prev) =>
        prev.map((d) =>
          d.id === desk.id
            ? { id: d.id, name: d.name, status: "available" }
            : d
        )
      );
    } catch {
      // Re-sync from server on failure
      await fetchDesksForDate(selectedDate);
    }
  }

  // ─── Derived ────────────────────────────────────────────────────────────────

  const visibleDesks =
    filter === "available" ? desks.filter((d) => d.status === "available") : desks;

  const selectedDateLabel = isToday
    ? "Today"
    : isTomorrow
    ? "Tomorrow"
    : selectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: tokens.space.s40, alignItems: "flex-start" }}>
      {/* ─── Left: Desk grid ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: tokens.space.s24 }}>
          <h2
            style={{
              fontSize: tokens.type.h2,
              fontWeight: 500,
              color: tokens.color.text.primary,
              letterSpacing: "-0.025em",
              margin: 0,
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

        {/* Date strip */}
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s8, marginBottom: tokens.space.s24 }}>
          <DatePill label="Today" active={isToday} onClick={() => handleDateSelect(today, "")} />
          <DatePill label="Tomorrow" active={isTomorrow} onClick={() => handleDateSelect(tomorrow, "")} />

          {/* Custom date */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space.s8,
                padding: `${tokens.space.s8} ${tokens.space.s16}`,
                borderRadius: tokens.radius.full,
                border: `1px solid ${!isToday && !isTomorrow ? tokens.color.accent.primaryBorder : tokens.color.border.subtle}`,
                background: !isToday && !isTomorrow ? tokens.color.accent.primaryBg : "rgba(255,255,255,0.6)",
                color: !isToday && !isTomorrow ? tokens.color.accent.primary : tokens.color.text.muted,
                fontSize: tokens.type.micro,
                fontWeight: !isToday && !isTomorrow ? 500 : 400,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                whiteSpace: "nowrap",
              }}
            >
              <CalendarIcon size={14} />
              {!isToday && !isTomorrow ? selectedDateLabel : "Pick Date"}
            </button>
            <input
              type="date"
              value={customDateStr}
              min={todayStr}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const [y, m, d] = val.split("-").map(Number);
                handleDateSelect(new Date(y, (m as number) - 1, d as number), val);
              }}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
            />
          </div>

          {/* Loading indicator */}
          {loading && (
            <span style={{ fontSize: tokens.type.micro, color: tokens.color.text.muted }}>
              Loading…
            </span>
          )}
        </div>

        {/* Desk grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: tokens.space.s24,
            opacity: loading ? 0.6 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {visibleDesks.map((desk) => {
            const isOwn = desk.status === "booked" && desk.userId === currentUserId;
            return (
              <DeskCard
                key={desk.id}
                name={desk.name}
                status={desk.status}
                user={desk.user}
                duration={desk.duration}
                isOwn={isOwn}
                onClick={desk.status === "available" ? () => handleDeskClick(desk) : undefined}
                onCancel={isOwn ? () => handleCancelReservation(desk) : undefined}
              />
            );
          })}
          {isAdmin && filter === "all" && <DeskCard name="" status="available" variant="addNew" />}
        </div>
      </div>

      {/* ─── Right: This Week card ───────────────────────────────────────────── */}
      <div style={{ width: 392, flexShrink: 0 }}>
        <div
          style={{
            padding: tokens.space.s32,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.8)",
            borderRadius: tokens.radius.r32,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.s32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3
              style={{
                color: tokens.color.text.primary,
                fontSize: tokens.type.h2,
                fontWeight: 500,
                letterSpacing: "-0.025em",
                margin: 0,
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
                borderRadius: tokens.radius.full,
              }}
            >
              <EllipsisIcon />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s24 }}>
            {weekOccupancy.map((day, index) => (
              <div key={day.dateLabel} style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ color: tokens.color.text.primary, fontSize: tokens.type.body, fontWeight: 500 }}>
                      {day.label}{" "}
                    </span>
                    <span style={{ color: tokens.color.text.muted, fontSize: tokens.type.micro, fontWeight: 300 }}>
                      {day.dateLabel}
                    </span>
                  </div>
                  <span
                    style={
                      index <= 1
                        ? {
                            background: `linear-gradient(135deg, ${tokens.color.accent.primary}, ${tokens.color.accent.secondary})`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: tokens.type.micro,
                            fontWeight: 500,
                          }
                        : {
                            color: tokens.color.text.secondary,
                            fontSize: tokens.type.micro,
                            fontWeight: 400,
                          }
                    }
                  >
                    {day.percent}% Full
                  </span>
                </div>
                <ProgressBar value={day.percent} highlight={index <= 1} />
              </div>
            ))}
          </div>

          {/* CTA — link to reservations page */}
          <Link
            href="/reservations"
            style={{ textDecoration: "none" }}
          >
            <Button variant="gradient" fullWidth icon={<ArrowRightIcon size={16} />}>
              My Reservations
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Booking drawer ──────────────────────────────────────────────────── */}
      {drawerDesk && (
        <ReservationDrawer
          desk={drawerDesk}
          todayUsers={todayUsers}
          initialDate={selectedDate}
          onClose={() => setDrawerDesk(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DatePillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function DatePill({ label, active, onClick }: DatePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: `${tokens.space.s8} ${tokens.space.s16}`,
        borderRadius: tokens.radius.full,
        border: `1px solid ${active ? tokens.color.accent.primaryBorder : tokens.color.border.subtle}`,
        background: active ? tokens.color.accent.primaryBg : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: active ? tokens.color.accent.primary : tokens.color.text.secondary,
        fontWeight: active ? 500 : 400,
        fontSize: tokens.type.micro,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
