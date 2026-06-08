"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tokens } from "@/styles/tokens.config";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { MonitorIcon, CloseIcon, CalendarIcon, ClockIcon, CheckIcon } from "@/components/icons";
import { createReservation } from "@/lib/api/reservations";
import { toLocalDateString, addDays } from "@/lib/utils/date";
import type { UserSummary } from "@/types/domain";

interface DeskInfo {
  id: string;
  name: string;
}

interface ReservationDrawerProps {
  desk: DeskInfo;
  todayUsers: UserSummary[];
  onClose: () => void;
  initialDate?: Date;
  onSuccess?: () => void;
}

export function ReservationDrawer({ desk, todayUsers, onClose, initialDate, onSuccess }: ReservationDrawerProps) {
  const router = useRouter();
  const today = new Date();
  const tomorrow = addDays(today, 1);

  const [selectedDate, setSelectedDate] = useState<Date>(initialDate ?? today);
  const [customDate, setCustomDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const dateStr = toLocalDateString(selectedDate);
  const isToday = dateStr === toLocalDateString(today);
  const isTomorrow = dateStr === toLocalDateString(tomorrow);

  async function handleConfirm() {
    setError("");
    try {
      await createReservation(desk.id, dateStr);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.refresh();
        }
        onClose();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const visibleUsers = todayUsers.slice(0, 3);
  const overflowCount = Math.max(0, todayUsers.length - visibleUsers.length);

  return (
    <>
      {/* Dimmed overlay */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 40 }}
      />

      {/* Drawer panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          background: tokens.color.surface.level1,
          boxShadow: "-4px 0 40px rgba(0,0,0,0.08)",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: `${tokens.space.s24} ${tokens.space.s24} ${tokens.space.s20}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${tokens.color.border.subtle}`,
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: tokens.type.h2, fontWeight: 500, color: tokens.color.text.primary, letterSpacing: "-0.025em" }}>
            Booking Details
          </h2>
          <button
            onClick={onClose}
            type="button"
            style={{
              background: tokens.color.surface.level2,
              border: `1px solid ${tokens.color.border.subtle}`,
              borderRadius: tokens.radius.r12,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: tokens.color.text.muted,
              cursor: "pointer",
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: tokens.space.s24, display: "flex", flexDirection: "column", gap: tokens.space.s24 }}>

          {/* Workspace identity */}
          <div
            style={{
              padding: tokens.space.s20,
              background: tokens.color.accent.primaryBg,
              borderRadius: tokens.radius.r16,
              border: `1px solid ${tokens.color.accent.primaryBorder}`,
              display: "flex",
              alignItems: "center",
              gap: tokens.space.s16,
            }}
          >
            <div
              style={{
                width: 44, height: 44,
                borderRadius: tokens.radius.r12,
                background: tokens.color.accent.secondaryBg,
                border: `1px solid ${tokens.color.accent.secondaryBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: tokens.color.accent.primary,
                flexShrink: 0,
              }}
            >
              <MonitorIcon size={20} />
            </div>
            <div>
              <p style={{ fontSize: tokens.type.body, fontWeight: 500, color: tokens.color.text.primary, marginBottom: tokens.space.s4 }}>
                {desk.name}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s8 }}>
                <div style={{ width: 8, height: 8, borderRadius: tokens.radius.full, background: tokens.color.status.success }} />
                <span style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary }}>Available to book</span>
              </div>
            </div>
          </div>

          {/* Date selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
            <SectionLabel>Select Date</SectionLabel>
            <div style={{ display: "flex", gap: tokens.space.s8 }}>
              <DatePill
                label="Today"
                active={isToday}
                onClick={() => { setSelectedDate(today); setCustomDate(""); }}
              />
              <DatePill
                label="Tomorrow"
                active={isTomorrow}
                onClick={() => { setSelectedDate(tomorrow); setCustomDate(""); }}
              />
            </div>
            {/* Custom date — invisible native input overlays the button */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space.s8,
                  padding: `${tokens.space.s12} ${tokens.space.s16}`,
                  borderRadius: tokens.radius.r12,
                  border: `1px solid ${!isToday && !isTomorrow ? tokens.color.accent.primaryBorder : tokens.color.border.subtle}`,
                  background: !isToday && !isTomorrow ? tokens.color.accent.primaryBg : tokens.color.surface.level2,
                  color: !isToday && !isTomorrow ? tokens.color.accent.primary : tokens.color.text.secondary,
                  fontSize: tokens.type.caption,
                  cursor: "pointer",
                }}
              >
                <CalendarIcon size={16} />
                {!isToday && !isTomorrow
                  ? selectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
                  : "Choose Custom Date"}
              </button>
              <input
                type="date"
                value={customDate}
                min={toLocalDateString(today)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  setCustomDate(val);
                  const [y, m, d] = val.split("-").map(Number);
                  setSelectedDate(new Date(y, (m as number) - 1, d as number));
                }}
                style={{
                  position: "absolute", inset: 0,
                  opacity: 0, cursor: "pointer",
                }}
              />
            </div>
          </div>

          {/* Booking summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
            <SectionLabel>Duration Summary</SectionLabel>
            <div
              style={{
                borderRadius: tokens.radius.r16,
                border: `1px solid ${tokens.color.border.subtle}`,
                background: tokens.color.surface.level1,
                boxShadow: tokens.shadow.e1,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: tokens.space.s16,
                  background: tokens.color.surface.level2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderBottom: `1px solid ${tokens.color.border.subtle}`,
                  color: tokens.color.text.muted,
                }}
              >
                <ClockIcon size={16} />
              </div>
              <div style={{ padding: tokens.space.s16 }}>
                <p style={{ fontSize: tokens.type.body, fontWeight: 500, color: tokens.color.text.primary, marginBottom: tokens.space.s4 }}>
                  All Day Access
                </p>
                <p style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary }}>
                  {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                  {" \u2014 "}09:00 AM — 05:00 PM
                </p>
              </div>
            </div>
          </div>

          {/* Team presence */}
          {todayUsers.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}>
              <SectionLabel>Who&apos;s Around Today</SectionLabel>
              <div
                style={{
                  padding: tokens.space.s16,
                  background: tokens.color.surface.level2,
                  borderRadius: tokens.radius.r16,
                  border: `1px solid ${tokens.color.border.subtle}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: tokens.space.s8 }}>
                  {visibleUsers.map((u) => (
                    <Avatar key={u.id} name={u.name ?? "?"} src={u.image} alt={u.name ?? ""} size={40} showName={false} />
                  ))}
                  {overflowCount > 0 && (
                    <div
                      style={{
                        width: 40, height: 40,
                        borderRadius: tokens.radius.full,
                        background: tokens.color.border.strong,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: tokens.type.micro,
                        color: tokens.color.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      +{overflowCount}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: tokens.type.caption, fontWeight: 500, color: tokens.color.text.primary }}>
                    {todayUsers.length} Teammate{todayUsers.length !== 1 ? "s" : ""}
                  </p>
                  <p style={{ fontSize: tokens.type.micro, color: tokens.color.text.secondary }}>Working nearby</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                padding: `${tokens.space.s12} ${tokens.space.s16}`,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: tokens.radius.r12,
                color: tokens.color.status.error,
                fontSize: tokens.type.caption,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div style={{ padding: tokens.space.s24, borderTop: `1px solid ${tokens.color.border.subtle}`, flexShrink: 0 }}>
          <Button
            variant="primary"
            fullWidth
            disabled={success}
            onClick={handleConfirm}
            icon={<CheckIcon />}
            style={success ? { background: tokens.color.status.success, padding: `${tokens.space.s16} ${tokens.space.s24}` } : { padding: `${tokens.space.s16} ${tokens.space.s24}` }}
          >
            {success ? "Booking confirmed!" : "Confirm Booking"}
          </Button>
        </div>
      </aside>
    </>
  );
}

// ─── Local sub-components ─────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: tokens.type.caption, fontWeight: 500, color: tokens.color.text.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {children}
    </p>
  );
}

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
        flex: 1,
        padding: `${tokens.space.s12} ${tokens.space.s16}`,
        borderRadius: tokens.radius.r12,
        border: `1px solid ${active ? tokens.color.accent.primaryBorder : tokens.color.border.subtle}`,
        background: active ? tokens.color.accent.primaryBg : tokens.color.surface.level2,
        color: active ? tokens.color.accent.primary : tokens.color.text.secondary,
        fontWeight: active ? 500 : 400,
        fontSize: tokens.type.caption,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
