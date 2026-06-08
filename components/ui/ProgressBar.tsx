import { tokens } from "@/styles/tokens.config";

interface ProgressBarProps {
  value: number;
  height?: number;
  /** Use gradient fill — for today / tomorrow rows */
  highlight?: boolean;
}

export function ProgressBar({ value, height = 6, highlight = true }: ProgressBarProps) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: tokens.radius.full,
        background: "rgba(226,232,240,0.5)",
        overflow: "hidden",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          borderRadius: tokens.radius.full,
          background: highlight
            ? "linear-gradient(135deg, var(--token-accent-primary), var(--token-accent-secondary))"
            : tokens.color.border.strong,
          boxShadow: highlight ? "0 0 10px 0 rgba(99,102,241,0.5)" : "none",
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}
