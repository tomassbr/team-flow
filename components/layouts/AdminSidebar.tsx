"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { MonitorIcon } from "@/components/icons";
import { tokens } from "@/styles/tokens.config";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <rect x="32" y="32" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <rect x="144" y="32" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <rect x="32" y="144" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <rect x="144" y="144" width="80" height="80" rx="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <circle cx="128" cy="128" r="40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      <path d="M210.35,82.19l8.19-14.18a8,8,0,0,0-1.44-9.88l-19.26-19.26a8,8,0,0,0-9.88-1.44L174,45.62a87.66,87.66,0,0,0-30-12.3l-3.11-15.55A8,8,0,0,0,133.1,12H122.9a8,8,0,0,0-7.83,6.37L112,33.32a87.66,87.66,0,0,0-30,12.3L67.78,37.43a8,8,0,0,0-9.88,1.44L38.64,58.13a8,8,0,0,0-1.44,9.88l8.19,14.18a87.87,87.87,0,0,0,0,51.62l-8.19,14.18a8,8,0,0,0,1.44,9.88l19.26,19.26a8,8,0,0,0,9.88,1.44L82,170.38a87.66,87.66,0,0,0,30,12.3l3.11,15.55A8,8,0,0,0,122.9,204h10.2a8,8,0,0,0,7.83-6.37L144,182.68a87.66,87.66,0,0,0,30-12.3l14.18,8.19a8,8,0,0,0,9.88-1.44l19.26-19.26a8,8,0,0,0,1.44-9.88l-8.19-14.18A88,88,0,0,0,210.35,82.19Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <GridIcon /> },
  { label: "Desks", href: "/admin", icon: <MonitorIcon size={18} /> },
  { label: "Settings", href: "/settings", icon: <SettingsIcon /> },
];

interface AdminSidebarProps {
  appName?: string;
  logoLetters?: string;
  userName: string;
  userRole: string;
}

export function AdminSidebar({
  appName = "Team Flow",
  logoLetters = "TF",
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
              key={item.label}
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
