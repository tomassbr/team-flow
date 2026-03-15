import { tokens } from "@/styles/tokens.config";

interface LogoProps {
  letters: string;
  size?: number;
}

export function Logo({ letters, size = 40 }: LogoProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: tokens.color.accent.primary,
        color: tokens.color.text.onAccent,
        borderRadius: tokens.radius.r12,
        fontSize: "var(--token-type-caption)",
        fontWeight: 500,
      }}
    >
      {letters}
    </div>
  );
}
