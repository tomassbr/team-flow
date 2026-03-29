import type { CSSProperties, ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";

type CardVariant = "default" | "elevated";
type CardPadding = "sm" | "md" | "lg";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

const paddingMap: Record<CardPadding, string> = {
  sm: tokens.space.s12,
  md: tokens.space.s16,
  lg: tokens.space.s24,
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  style,
  className = "",
  onClick,
}: CardProps) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background:
          variant === "elevated"
            ? tokens.color.surface.elevated
            : tokens.color.surface.level1,
        borderRadius: tokens.radius.r20,
        border: `1px solid ${tokens.color.border.subtle}`,
        boxShadow: variant === "elevated" ? tokens.shadow.e2 : tokens.shadow.e1,
        padding: paddingMap[padding],
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
