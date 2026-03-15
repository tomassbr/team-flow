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

export function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div
      style={{
        display: "flex",
        borderRadius: tokens.radius.full,
        background: tokens.color.surface.level2,
        border: `1px solid ${tokens.color.border.subtle}`,
        padding: tokens.space.s8,
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
              padding: `${tokens.space.s8} ${tokens.space.s16}`,
              borderRadius: tokens.radius.full,
              background: isSelected ? tokens.color.surface.level1 : "transparent",
              color: isSelected
                ? tokens.color.text.primary
                : tokens.color.text.muted,
              fontSize: tokens.type.micro,
              fontWeight: 400,
              border: "none",
              cursor: "pointer",
              boxShadow: isSelected ? tokens.shadow.e1 : "none",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
