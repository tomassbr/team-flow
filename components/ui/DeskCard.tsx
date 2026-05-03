import type { ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";
import { Avatar } from "./Avatar";

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

interface DeskCardProps {
  name: string;
  status: "available" | "booked";
  user?: string;
  duration?: string;
  icon?: ReactNode;
  variant?: "default" | "addNew";
  isSelected?: boolean;
  onClick?: () => void;
}

export function DeskCard({
  name,
  status,
  user,
  duration,
  icon,
  variant = "default",
  isSelected = false,
  onClick,
}: DeskCardProps) {
  if (variant === "addNew") {
    return (
      <div
        style={{
          padding: tokens.space.s24,
          borderRadius: tokens.radius.r24,
          border: `2px dashed ${tokens.color.border.strong}`,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space.s16,
          minHeight: 148,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: tokens.radius.full,
            border: `2px solid ${tokens.color.accent.secondary}`,
            color: tokens.color.accent.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlusIcon />
        </div>
        <span
          style={{
            color: tokens.color.accent.secondary,
            fontSize: tokens.type.body,
            fontWeight: 500,
          }}
        >
          Add New Desk
        </span>
      </div>
    );
  }

  const isBooked = status === "booked";

  return (
    <div
      onClick={onClick}
      style={{
        padding: tokens.space.s24,
        borderRadius: tokens.radius.r24,
        background: isBooked
          ? "linear-gradient(135deg, #C6D1FF 0%, #CFFAFF 50%, #FFFFFF 100%)"
          : "rgba(255,255,255,0.95)",
        backdropFilter: isBooked ? "blur(24px)" : "blur(16px)",
        WebkitBackdropFilter: isBooked ? "blur(24px)" : "blur(16px)",
        border: isSelected
          ? "2px solid transparent"
          : `1px solid ${isBooked ? "rgba(198,209,255,0.6)" : "rgba(255,255,255,0.9)"}`,
        boxShadow: isSelected
          ? "0 0 0 2px #6366F1, 0 0 20px 4px rgba(99,102,241,0.2), 0 4px 16px rgba(0,0,0,0.06)"
          : "0 1px 2px rgba(0,0,0,0.05), 0 8px 16px rgba(0,0,0,0.03)",
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.s24,
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        position: "relative",
      }}
    >
      {/* Top row: icon/avatar + status chip */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        {isBooked ? (
          <Avatar name={user ?? "?"} alt={user ?? ""} size={40} showName={false} />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.full,
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,255,255,1)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#63748C",
            }}
          >
            {icon ?? <MonitorIcon />}
          </div>
        )}

        {/* Status badge */}
        {isBooked ? (
          /* Booked chip */
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space.s8,
              padding: `${tokens.space.s4} ${tokens.space.s12}`,
              borderRadius: tokens.radius.full,
              background: "rgba(237,241,255,0.8)",
              border: "1px solid rgba(198,209,255,0.6)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: tokens.radius.full,
                background: tokens.color.accent.primary,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: tokens.color.accent.primary,
                fontSize: tokens.type.micro,
                fontWeight: 500,
              }}
            >
              Booked
            </span>
          </div>
        ) : (
          /* Available chip — glass mint, no dot */
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: `${tokens.space.s4} ${tokens.space.s12}`,
              borderRadius: tokens.radius.full,
              background: "rgba(237,253,244,0.8)",
              border: "1px solid rgba(166,243,208,0.5)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            <span
              style={{
                color: "#059669",
                fontSize: tokens.type.micro,
                fontWeight: 500,
              }}
            >
              Available
            </span>
          </div>
        )}
      </div>

      {/* Bottom row: name + user/duration */}
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8 }}>
        <span
          style={{
            color: tokens.color.text.primary,
            fontSize: tokens.type.body,
            fontWeight: 500,
          }}
        >
          {name}
        </span>
        {isBooked && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: tokens.color.text.secondary, fontSize: tokens.type.micro }}>
              {user}
            </span>
            <span style={{ color: tokens.color.text.muted, fontSize: tokens.type.micro }}>
              {duration}
            </span>
          </div>
        )}
        {!isBooked && isSelected && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: tokens.space.s4,
              padding: `2px ${tokens.space.s8}`,
              borderRadius: tokens.radius.full,
              background: tokens.color.accent.primaryBg,
              border: `1px solid ${tokens.color.accent.primaryBorder}`,
              alignSelf: "flex-start",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: tokens.radius.full,
                background: tokens.color.accent.primary,
              }}
            />
            <span
              style={{
                color: tokens.color.accent.primary,
                fontSize: tokens.type.micro,
                fontWeight: 500,
              }}
            >
              Selected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
