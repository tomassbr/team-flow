import { tokens } from "@/styles/tokens.config";

interface LogoProps {
  letters: string;
  size?: number;
  variant?: "default" | "onDark";
}

export function Logo({ letters, size = 40, variant = "default" }: LogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          variant === "onDark"
            ? "rgba(255, 255, 255, 0.12)"
            : tokens.color.button.primary,
        color: tokens.color.text.onAccent,
        borderRadius: tokens.radius.r12,
        fontSize: tokens.type.caption,
        fontWeight: 500,
        flexShrink: 0,
        letterSpacing: "-0.04em",
      }}
    >
      {letters}
    </div>
  );
}
