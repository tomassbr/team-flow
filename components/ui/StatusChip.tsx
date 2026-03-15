import { tokens } from "@/styles/tokens.config";

interface StatusChipProps {
  status: "available" | "booked";
  label: string;
}

export function StatusChip({ status, label }: StatusChipProps) {
  const color =
    status === "available"
      ? tokens.color.status.success
      : tokens.color.accent.secondary;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space.s8,
        padding: `${tokens.space.s4} ${tokens.space.s12}`,
        borderRadius: tokens.radius.full,
        background:
          status === "available"
            ? "var(--token-status-success-bg)"
            : "var(--token-accent-secondary-bg)",
        border: `1px solid ${
          status === "available"
            ? "var(--token-status-success-border)"
            : "var(--token-accent-secondary-border)"
        }`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: tokens.radius.full,
          background: color,
        }}
      />
      <span
        style={{
          color,
          fontSize: tokens.type.micro,
          fontWeight: 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}
