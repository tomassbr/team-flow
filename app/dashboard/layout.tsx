import { auth } from "@/auth";
import { AdminModeToggle } from "@/components/dashboard/AdminModeToggle";
import { Logo } from "@/components/ui/Logo";
import { tokens } from "@/styles/tokens.config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userName = session?.user?.name ?? "User";
  const userRole = "Product Design";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.color.bg.base,
      }}
    >
      {/* Header — tokens: surface/level1, accent/primary, space/32, space/40 */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${tokens.space.s32} ${tokens.space.s40}`,
          background: tokens.color.surface.level1,
          boxShadow: tokens.shadow.e1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.s16,
          }}
        >
          <Logo letters="TS" />
          <span
            style={{
              color: tokens.color.text.primary,
              fontSize: tokens.type.h2,
              fontWeight: 500,
              letterSpacing: "-0.025em",
            }}
          >
            Team Space
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: tokens.space.s24,
          }}
        >
          <AdminModeToggle />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space.s16,
              borderLeft: `1px solid ${tokens.color.border.subtle}`,
              paddingLeft: tokens.space.s16,
            }}
          >
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  color: tokens.color.text.primary,
                  fontSize: tokens.type.caption,
                  fontWeight: 400,
                }}
              >
                {userName}
              </p>
              <p
                style={{
                  color: tokens.color.text.muted,
                  fontSize: tokens.type.micro,
                  fontWeight: 400,
                }}
              >
                {userRole}
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
              }}
            >
              {userName.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          display: "flex",
          padding: `${tokens.space.s24} ${tokens.space.s40}`,
          gap: tokens.space.s40,
        }}
      >
        {children}
      </main>
    </div>
  );
}
