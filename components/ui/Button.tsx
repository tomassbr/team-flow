import type { ButtonHTMLAttributes, ReactNode, CSSProperties } from "react";
import { tokens } from "@/styles/tokens.config";

type Variant = "primary" | "secondary" | "accent" | "gradient";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "style"> {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
}

const baseStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: tokens.space.s8,
  padding: `${tokens.space.s12} ${tokens.space.s20}`,
  borderRadius: tokens.radius.r16,
  fontSize: tokens.type.body,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    backgroundColor: tokens.color.button.primary,
    color: tokens.color.text.onAccent,
  },
  accent: {
    backgroundColor: tokens.color.accent.primary,
    color: tokens.color.text.onAccent,
  },
  secondary: {
    background: tokens.color.surface.level2,
    color: tokens.color.text.primary,
    border: `1px solid ${tokens.color.border.strong}`,
  },
  gradient: {
    backgroundColor: tokens.color.button.primary,
    color: tokens.color.text.onAccent,
    padding: `${tokens.space.s16} ${tokens.space.s24}`,
  },
};

export function Button({
  children,
  variant = "primary",
  icon,
  fullWidth = false,
  className = "",
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const buttonStyle: CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    width: fullWidth ? "100%" : undefined,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    position: "relative",
    zIndex: 1,
    ...style,
  };

  const iconNode = icon && (
    <span
      style={{
        color: variant === "gradient" ? tokens.color.accent.secondary : "inherit",
        display: "inline-flex",
      }}
    >
      {icon}
    </span>
  );

  if (variant === "gradient") {
    return (
      <div
        style={{
          position: "relative",
          display: fullWidth ? "flex" : "inline-flex",
          width: fullWidth ? "100%" : undefined,
        }}
      >
        {/* Ambient gradient glow layer behind the button */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: 22,
            background: `linear-gradient(to right, ${tokens.color.accent.primary}, ${tokens.color.accent.secondary})`,
            filter: "blur(14px)",
            opacity: 0.65,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <button
          className={className}
          style={{ ...buttonStyle, width: fullWidth ? "100%" : undefined }}
          disabled={disabled}
          {...props}
        >
          {iconNode}
          {children}
        </button>
      </div>
    );
  }

  return (
    <button className={className} style={buttonStyle} disabled={disabled} {...props}>
      {iconNode}
      {children}
    </button>
  );
}
