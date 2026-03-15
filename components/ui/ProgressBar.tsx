import { tokens } from "@/styles/tokens.config";

interface ProgressBarProps {
  value: number;
  height?: number;
}

export function ProgressBar({ value, height = 6 }: ProgressBarProps) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: tokens.radius.full,
        background: tokens.color.border.subtle,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          borderRadius: tokens.radius.full,
          background: tokens.gradient.brand,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
