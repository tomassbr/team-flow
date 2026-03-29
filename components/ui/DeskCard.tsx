import type { ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";
import { Avatar } from "./Avatar";
import { StatusChip } from "./StatusChip";

function MonitorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
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
}

export function DeskCard({
  name,
  status,
  user,
  duration,
  icon,
  variant = "default",
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
          minHeight: 140,
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

  return (
    <div
      style={{
        padding: tokens.space.s24,
        borderRadius: tokens.radius.r24,
        background:
          status === "booked"
            ? tokens.surface.booked
            : tokens.color.surface.level1,
        border: `1px solid ${tokens.color.border.subtle}`,
        boxShadow: tokens.shadow.e1,
        display: "flex",
        flexDirection: "column",
        gap: tokens.space.s24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {status === "available" ? (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: tokens.radius.full,
              background: tokens.color.surface.level2,
              border: `1px solid ${tokens.color.border.subtle}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: tokens.color.text.muted,
            }}
          >
            {icon ?? <MonitorIcon />}
          </div>
        ) : (
          <Avatar
            name={user ?? "?"}
            alt={user ?? ""}
            size={40}
            showName={false}
          />
        )}
        {status === "booked" && (
          <StatusChip status="booked" label="Booked" />
        )}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s24,
          alignItems: "flex-start",
        }}
      >
        <span
          style={{
            color: tokens.color.text.primary,
            fontSize: tokens.type.body,
            fontWeight: 500,
          }}
        >
          {name}
        </span>
        {status === "available" ? (
          <StatusChip status="available" label="Available" />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: tokens.color.text.secondary,
              fontSize: tokens.type.micro,
            }}
          >
            <span>{user}</span>
            <span>{duration}</span>
          </div>
        )}
      </div>
    </div>
  );
}
