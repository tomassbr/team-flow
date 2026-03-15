import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gradient";
  icon?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.space.s12,
    padding: `${tokens.space.s8} ${tokens.space.s16}`,
    borderRadius: tokens.radius.r16,
    fontSize: tokens.type.body,
    fontWeight: 500,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity 0.2s",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: tokens.color.accent.primary,
      color: tokens.color.text.onAccent,
    },
    secondary: {
      background: tokens.color.surface.level2,
      color: tokens.color.text.primary,
      border: `1px solid ${tokens.color.border.strong}`,
    },
    gradient: {
      background: tokens.gradient.brand,
      color: tokens.color.text.onAccent,
      boxShadow: tokens.shadow.e2,
    },
  };

  return (
    <button
      className={className}
      style={{ ...baseStyles, ...variantStyles[variant], ...style }}
      disabled={disabled}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
