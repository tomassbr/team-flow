import { Logo } from "@/components/ui/Logo";
import { AdminModeToggle } from "@/components/dashboard/AdminModeToggle";
import { tokens } from "@/styles/tokens.config";

interface AppHeaderProps {
  appName?: string;
  logoLetters?: string;
  userName: string;
  userRole: string;
  userImage?: string | null;
}

export function AppHeader({
  appName = "Team Space",
  logoLetters = "TS",
  userName,
  userRole,
  userImage,
}: AppHeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${tokens.space.s32} ${tokens.space.s40}`,
      }}
    >
      {/* Left — Logo + App name */}
      <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s16 }}>
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
      </div>

      {/* Right — Admin toggle + User profile */}
      <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s24 }}>
        <AdminModeToggle />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: tokens.color.border.subtle,
          }}
        />

        {/* User profile */}
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s16 }}>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                color: tokens.color.text.primary,
                fontSize: tokens.type.caption,
                fontWeight: 400,
                margin: 0,
              }}
            >
              {userName}
            </p>
            <p
              style={{
                color: tokens.color.text.muted,
                fontSize: tokens.type.micro,
                fontWeight: 400,
                margin: 0,
              }}
            >
              {userRole}
            </p>
          </div>

          {/* Avatar */}
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
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userImage}
                alt={userName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initial
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
