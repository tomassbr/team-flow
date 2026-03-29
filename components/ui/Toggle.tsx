"use client";

import { tokens } from "@/styles/tokens.config";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s12 }}>
      {label && (
        <span
          style={{
            color: tokens.color.text.muted,
            fontSize: tokens.type.micro,
            fontWeight: 400,
          }}
        >
          {label}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        style={{
          width: 40,
          height: 20,
          borderRadius: tokens.radius.full,
          background: checked
            ? tokens.color.accent.primary
            : tokens.color.border.strong,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          padding: 0,
          position: "relative",
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
    </div>
  );
}
