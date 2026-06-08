"use client";

import { useState } from "react";
import Link from "next/link";
import { tokens } from "@/styles/tokens.config";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { MonitorIcon, CalendarIcon, EllipsisIcon } from "@/components/icons";
import { cancelReservation } from "@/lib/api/reservations";
import type { WeekDay } from "@/lib/data/dashboard";

interface ReservationRow {
  id: string;
  date: string; // "YYYY-MM-DD"
  status: "RESERVED" | "CONFIRMED" | "RELEASED";
  desk: { id: string; name: string };
}

interface ReservationsClientProps {
  reservations: ReservationRow[];
  weekOccupancy: WeekDay[];
}

export function ReservationsClient({ reservations: initialReservations, weekOccupancy }: ReservationsClientProps) {
  const [reservations, setReservations] = useState<ReservationRow[]>(initialReservations);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0] as string;

  const upcoming = reservations.filter((r) => r.date >= todayStr && r.status !== "RELEASED");
  const past = reservations.filter((r) => r.date < todayStr || r.status === "RELEASED");

  async function handleCancel(reservation: ReservationRow) {
    setCancelling(reservation.id);
    try {
      await cancelReservation(reservation.id);
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id));
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: tokens.space.s40, alignItems: "flex-start" }}>
      {/* ─── Left: reservation list ─────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: tokens.space.s32 }}>

        {/* Upcoming */}
        <section>
          <h2 style={{ fontSize: tokens.type.h2, fontWeight: 500, color: tokens.color.text.primary, letterSpacing: "-0.025em", margin: `0 0 ${tokens.space.s16}` }}>
            Upcoming
          </h2>

          {upcoming.length === 0 ? (
            <EmptyState
              message="No upcoming reservations"
              cta={<Link href="/dashboard" style={{ textDecoration: "none" }}><Button variant="primary" icon={<CalendarIcon size={16} />}>Book a Desk</Button></Link>}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
              {upcoming.map((r) => (
                <ReservationCard
                  key={r.id}
                  reservation={r}
                  isUpcoming
                  isCancelling={cancelling === r.id}
                  onCancel={() => handleCancel(r)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section>
            <h2 style={{ fontSize: tokens.type.h2, fontWeight: 500, color: tokens.color.text.primary, letterSpacing: "-0.025em", margin: `0 0 ${tokens.space.s16}` }}>
              Past
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
              {past.slice().reverse().map((r) => (
                <ReservationCard key={r.id} reservation={r} isUpcoming={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ─── Right: This Week card ───────────────────────────────────────────── */}
      <div style={{ width: 360, flexShrink: 0 }}>
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
            <h3 style={{ fontSize: tokens.type.h2, fontWeight: 500, color: tokens.color.text.primary, letterSpacing: "-0.025em", margin: 0 }}>
              This Week
            </h3>
            <button type="button" style={{ background: "none", border: "none", color: tokens.color.text.muted, cursor: "pointer", padding: tokens.space.s8, borderRadius: tokens.radius.full }}>
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
                        : { color: tokens.color.text.secondary, fontSize: tokens.type.micro, fontWeight: 400 }
                    }
                  >
                    {day.percent}% Full
                  </span>
                </div>
                <ProgressBar value={day.percent} highlight={index <= 1} />
              </div>
            ))}
          </div>

          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <Button variant="gradient" fullWidth icon={<CalendarIcon size={16} />}>
              Book a Desk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Reservation card ─────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: ReservationRow;
  isUpcoming: boolean;
  isCancelling?: boolean;
  onCancel?: () => void;
}

function ReservationCard({ reservation, isUpcoming, isCancelling, onCancel }: ReservationCardProps) {
  const date = new Date(reservation.date + "T00:00:00");
  const formattedDate = date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const statusColor =
    reservation.status === "CONFIRMED"
      ? tokens.color.status.success
      : reservation.status === "RELEASED"
      ? tokens.color.text.muted
      : tokens.color.accent.primary;

  const statusBg =
    reservation.status === "CONFIRMED"
      ? "rgba(16,185,129,0.08)"
      : reservation.status === "RELEASED"
      ? "rgba(100,116,139,0.08)"
      : tokens.color.accent.primaryBg;

  const statusBorder =
    reservation.status === "CONFIRMED"
      ? "rgba(16,185,129,0.2)"
      : reservation.status === "RELEASED"
      ? "rgba(100,116,139,0.2)"
      : tokens.color.accent.primaryBorder;

  const statusLabel =
    reservation.status === "CONFIRMED"
      ? "Confirmed"
      : reservation.status === "RELEASED"
      ? "Released"
      : "Reserved";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: tokens.space.s16,
        padding: tokens.space.s16,
        background: tokens.color.surface.level1,
        borderRadius: tokens.radius.r16,
        border: `1px solid ${tokens.color.border.subtle}`,
        boxShadow: tokens.shadow.e1,
        opacity: isUpcoming ? 1 : 0.65,
      }}
    >
      {/* Desk icon */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: tokens.radius.r12,
          background: isUpcoming ? tokens.color.accent.primaryBg : tokens.color.surface.level2,
          border: `1px solid ${isUpcoming ? tokens.color.accent.primaryBorder : tokens.color.border.subtle}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isUpcoming ? tokens.color.accent.primary : tokens.color.text.muted,
          flexShrink: 0,
        }}
      >
        <MonitorIcon size={20} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: tokens.type.body, fontWeight: 500, color: tokens.color.text.primary, margin: 0 }}>
          {reservation.desk.name}
        </p>
        <p style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary, margin: `${tokens.space.s4} 0 0` }}>
          {formattedDate} · All Day
        </p>
      </div>

      {/* Status chip */}
      <div
        style={{
          padding: `${tokens.space.s4} ${tokens.space.s12}`,
          borderRadius: tokens.radius.full,
          background: statusBg,
          border: `1px solid ${statusBorder}`,
          color: statusColor,
          fontSize: tokens.type.micro,
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {statusLabel}
      </div>

      {/* Cancel button */}
      {isUpcoming && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isCancelling}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: tokens.radius.r12,
            background: isCancelling ? tokens.color.surface.level2 : "rgba(239,68,68,0.06)",
            border: `1px solid ${isCancelling ? tokens.color.border.subtle : "rgba(239,68,68,0.15)"}`,
            color: isCancelling ? tokens.color.text.muted : tokens.color.status.error,
            cursor: isCancelling ? "not-allowed" : "pointer",
            flexShrink: 0,
          }}
          title="Cancel reservation"
        >
          {isCancelling ? (
            <span style={{ fontSize: 10 }}>…</span>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ message, cta }: { message: string; cta?: React.ReactNode }) {
  return (
    <div
      style={{
        padding: `${tokens.space.s40} ${tokens.space.s24}`,
        background: tokens.color.surface.level2,
        borderRadius: tokens.radius.r16,
        border: `1px solid ${tokens.color.border.subtle}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.space.s16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: tokens.radius.r12,
          background: tokens.color.accent.primaryBg,
          border: `1px solid ${tokens.color.accent.primaryBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.color.accent.primary,
        }}
      >
        <CalendarIcon size={22} />
      </div>
      <div>
        <p style={{ fontSize: tokens.type.body, fontWeight: 500, color: tokens.color.text.primary, margin: 0 }}>
          {message}
        </p>
        <p style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary, margin: `${tokens.space.s4} 0 0` }}>
          Head to the dashboard to book a desk for any day.
        </p>
      </div>
      {cta}
    </div>
  );
}
