"use client";

import { useRouter } from "next/navigation";
import { tokens } from "@/styles/tokens.config";
import { Toggle } from "@/components/ui/Toggle";

export function AdminModeToggle() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.space.s12,
        padding: `${tokens.space.s8} ${tokens.space.s20}`,
        background: tokens.color.surface.level1,
        borderRadius: tokens.radius.full,
        boxShadow: tokens.shadow.e1,
      }}
    >
      <span
        style={{
          color: tokens.color.text.secondary,
          fontSize: tokens.type.caption,
          fontWeight: 400,
          whiteSpace: "nowrap",
        }}
      >
        Admin Mode
      </span>
      <Toggle checked={false} onChange={() => router.push("/admin")} />
    </div>
  );
}
