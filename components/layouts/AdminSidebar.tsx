"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { tokens } from "@/styles/tokens.config";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <GridIcon /> },
  { label: "Reservations", href: "/booking", icon: <CalendarIcon /> },
  { label: "Desks", href: "/admin", icon: <MonitorIcon /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

interface AdminSidebarProps {
  appName?: string;
  logoLetters?: string;
  userName: string;
  userRole: string;
}

export function AdminSidebar({
  appName = "Team Space",
  logoLetters = "TS",
  userName,
  userRole,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        minHeight: "100vh",
        background: tokens.color.button.primary,
        display: "flex",
        flexDirection: "column",
        padding: `${tokens.space.s32} 0`,
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: tokens.space.s12,
          padding: `0 ${tokens.space.s24}`,
          marginBottom: tokens.space.s40,
        }}
      >
        <Logo letters={logoLetters} variant="onDark" />
        <span
          style={{
            color: tokens.color.text.onAccent,
            fontSize: tokens.type.body,
            fontWeight: 500,
            letterSpacing: "var(--token-type-tracking)",
          }}
        >
          {appName}
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: tokens.space.s4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: tokens.space.s12,
                padding: `${tokens.space.s12} ${tokens.space.s24}`,
                color: isActive
                  ? tokens.color.text.onAccent
                  : "rgba(255, 255, 255, 0.5)",
                background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                textDecoration: "none",
                fontSize: tokens.type.body,
                fontWeight: isActive ? 500 : 400,
                borderRadius: 0,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7, display: "inline-flex" }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User profile at bottom */}
      <div
        style={{
          padding: `${tokens.space.s16} ${tokens.space.s24}`,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          gap: tokens.space.s12,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: tokens.radius.full,
            background: "rgba(255, 255, 255, 0.15)",
            color: tokens.color.text.onAccent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: tokens.type.micro,
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p
            style={{
              color: tokens.color.text.onAccent,
              fontSize: tokens.type.caption,
              fontWeight: 400,
              margin: 0,
            }}
          >
            {userName}
          </p>
          <p
            style={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: tokens.type.micro,
              fontWeight: 400,
              margin: 0,
            }}
          >
            {userRole}
          </p>
        </div>
      </div>
    </aside>
  );
}
