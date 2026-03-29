"use client";

import { useState } from "react";
import { tokens } from "@/styles/tokens.config";

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      style={{
        width: 40,
        height: 20,
        borderRadius: tokens.radius.full,
        background: checked ? tokens.color.accent.primary : tokens.color.border.strong,
        border: "none",
        cursor: "pointer",
        padding: 0,
        position: "relative",
        flexShrink: 0,
        transition: "background 0.2s",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 4,
          top: 4,
          width: 12,
          height: 12,
          borderRadius: tokens.radius.full,
          background: tokens.color.surface.level1,
          boxShadow: tokens.shadow.e1,
          transform: checked ? "translateX(20px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}
      />
    </button>
  );
}

export function AdminModeToggle() {
  const [adminMode, setAdminMode] = useState(false);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space.s12,
        padding: `${tokens.space.s8} ${tokens.space.s20}`,
        background: tokens.color.surface.level1,
        borderRadius: tokens.radius.full,
        boxShadow: tokens.shadow.e1,
      }}
    >
      <span
        style={{
          color: tokens.color.text.secondary,
          fontSize: tokens.type.caption,
          fontWeight: 400,
          whiteSpace: "nowrap",
        }}
      >
        Admin Mode
      </span>
      <ToggleSwitch checked={adminMode} onChange={() => setAdminMode((v) => !v)} />
    </div>
  );
}
