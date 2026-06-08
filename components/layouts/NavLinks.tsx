"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tokens } from "@/styles/tokens.config";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reservations", label: "My Reservations" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", alignItems: "center", gap: tokens.space.s4 }}>
      {NAV.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              padding: `${tokens.space.s8} ${tokens.space.s16}`,
              borderRadius: tokens.radius.full,
              fontSize: tokens.type.caption,
              fontWeight: active ? 500 : 400,
              color: active ? tokens.color.text.primary : tokens.color.text.muted,
              background: active ? tokens.color.surface.level1 : "transparent",
              boxShadow: active ? tokens.shadow.e1 : "none",
              textDecoration: "none",
              transition: "background 0.15s, color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
