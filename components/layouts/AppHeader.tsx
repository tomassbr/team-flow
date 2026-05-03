import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/ui/Logo";
import { AdminModeToggle } from "@/components/dashboard/AdminModeToggle";
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

        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s16 }}>
          {variant === "dashboard" && (
            <>
              <AdminModeToggle />
              <div
                style={{
                  width: 1,
                  height: 24,
                  background: tokens.color.border.subtle,
                }}
              />
            </>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s12 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: tokens.space.s8 }}>
                <p
                  style={{
                    color: tokens.color.text.primary,
                    fontSize: tokens.type.caption,
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {userName}
                </p>
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
              </div>
              <p
                style={{
                  color: tokens.color.text.muted,
                  fontSize: tokens.type.micro,
                  fontWeight: 400,
                  margin: 0,
                }}
              >
                {variant === "admin-page" ? "Workspace Operations" : userRole}
              </p>
            </div>

            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: tokens.radius.full,
                background: tokens.color.accent.secondary,
                color: tokens.color.text.onAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: tokens.type.caption,
                fontWeight: 500,
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {userImage ? (
                <Image src={userImage} alt={userName} width={40} height={40} style={{ objectFit: "cover" }} />
              ) : (
                initial
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
