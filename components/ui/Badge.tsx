import type { ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";

type BadgeVariant = "default" | "accent" | "success" | "info" | "warning" | "error";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: {
    bg: tokens.color.surface.level2,
    color: tokens.color.text.secondary,
    border: tokens.color.border.strong,
  },
  accent: {
    bg: tokens.color.accent.primaryBg,
    color: tokens.color.accent.primary,
    border: tokens.color.accent.primaryBorder,
  },
  success: {
    bg: tokens.color.status.successBg,
    color: tokens.color.status.success,
    border: tokens.color.status.successBorder,
  },
  info: {
    bg: "rgba(59, 130, 246, 0.1)",
    color: tokens.color.status.info,
    border: "rgba(59, 130, 246, 0.2)",
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.1)",
    color: tokens.color.status.warning,
    border: "rgba(245, 158, 11, 0.2)",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.1)",
    color: tokens.color.status.error,
    border: "rgba(239, 68, 68, 0.2)",
  },
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  const v = variantMap[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: `${tokens.space.s4} ${tokens.space.s8}`,
        borderRadius: tokens.radius.full,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
        fontSize: tokens.type.micro,
        fontWeight: 500,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
