import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { NavLinks } from "@/components/layouts/NavLinks";
import { CaretDownIcon } from "@/components/icons";
import { tokens } from "@/styles/tokens.config";

interface AppHeaderProps {
  appName?: string;
  logoLetters?: string;
  userName: string;
  userRole: "Member" | "Admin";
  userImage?: string | null;
  variant?: "dashboard" | "admin-page";
}

export function AppHeader({
  appName = "Team Flow",
  logoLetters = "TF",
  userName,
  userRole,
  userImage,
  variant = "dashboard",
}: AppHeaderProps) {
  const initial = userName.charAt(0).toUpperCase();
  const isAdmin = userRole === "Admin";

  return (
    <header style={{ padding: `${tokens.space.s24} ${tokens.space.s40}` }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.s12,
            textDecoration: "none",
          }}
        >
          <Logo letters={logoLetters} />
          <span
            style={{
              color: tokens.color.text.primary,
              fontSize: tokens.type.h2,
              fontWeight: 500,
              letterSpacing: "var(--token-type-tracking)",
            }}
          >
            {appName}
          </span>
        </Link>

        <NavLinks />

        {/* Profile pill — clear affordance for profile/settings entry */}
        <Link
          href="/settings"
          aria-label="Profile & settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.s8,
            padding: `${tokens.space.s4} ${tokens.space.s12} ${tokens.space.s4} ${tokens.space.s4}`,
            borderRadius: tokens.radius.full,
            background: tokens.color.surface.level2,
            border: `1px solid ${tokens.color.border.subtle}`,
            textDecoration: "none",
          }}
        >
          {/* Avatar with gradient ring */}
          <div
            style={{
              padding: 2,
              borderRadius: tokens.radius.full,
              background: `linear-gradient(135deg, ${tokens.color.accent.primary}, ${tokens.color.accent.secondary})`,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: tokens.radius.full,
                background: tokens.color.accent.secondary,
                color: tokens.color.text.onAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: tokens.type.micro,
                fontWeight: 500,
                overflow: "hidden",
                border: `2px solid ${tokens.color.surface.level2}`,
                boxSizing: "content-box",
              }}
            >
              {userImage ? (
                <Image src={userImage} alt={userName} width={32} height={32} style={{ objectFit: "cover" }} />
              ) : (
                initial
              )}
            </div>
          </div>

          <span
            style={{
              color: tokens.color.text.primary,
              fontSize: tokens.type.caption,
              fontWeight: 500,
            }}
          >
            {userName}
          </span>

          {variant === "admin-page" && isAdmin && (
            <span
              style={{
                padding: `2px ${tokens.space.s8}`,
                borderRadius: tokens.radius.full,
                fontSize: tokens.type.micro,
                fontWeight: 500,
                background: tokens.color.accent.primaryBg,
                color: tokens.color.accent.primary,
                border: `1px solid ${tokens.color.accent.primaryBorder}`,
              }}
            >
              Admin
            </span>
          )}

          <span style={{ color: tokens.color.text.muted, display: "flex" }}>
            <CaretDownIcon size={14} />
          </span>
        </Link>
      </div>
    </header>
  );
}
