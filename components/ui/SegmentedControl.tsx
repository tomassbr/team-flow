"use client";

import { tokens } from "@/styles/tokens.config";

interface Option {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: tokens.radius.full,
        background: "rgba(227,232,240,0.3)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
        padding: 4,
        gap: 0,
      }}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: `6px ${tokens.space.s16}`,
              borderRadius: tokens.radius.full,
              background: isSelected ? "rgba(255,255,255,0.9)" : "transparent",
              color: isSelected ? tokens.color.text.primary : tokens.color.text.muted,
              fontSize: tokens.type.micro,
              fontWeight: isSelected ? 500 : 400,
              border: "none",
              cursor: "pointer",
              boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)" : "none",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
