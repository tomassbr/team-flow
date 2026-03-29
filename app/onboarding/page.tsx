import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Logo } from "@/components/ui/Logo";
import { tokens } from "@/styles/tokens.config";
import { OnboardingForm } from "./OnboardingForm";

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const BENEFITS = [
  "Okamžitá dostupnost desků v reálném čase",
  "Přehled kdo je dnes v kanclu",
  "Jednoduché rezervace na celý týden",
];

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Already onboarded — go straight to the app.
  if (session.user.companyId) {
    redirect("/dashboard");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "tebe";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.color.bg.base,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.space.s24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s32,
        }}
      >
        {/* Header */}
        <div
          style={{ display: "flex", alignItems: "center", gap: tokens.space.s16 }}
        >
          <Logo letters="SO" size={40} />
          <span
            style={{
              fontSize: tokens.type.h2,
              fontWeight: 500,
              color: tokens.color.text.primary,
              letterSpacing: "-0.025em",
            }}
          >
            Team Flow
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: tokens.color.surface.level1,
            borderRadius: tokens.radius.r24,
            boxShadow: tokens.shadow.e3,
            padding: tokens.space.s40,
            display: "flex",
            flexDirection: "column",
            gap: tokens.space.s32,
          }}
        >
          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8 }}>
            <h1
              style={{
                fontSize: tokens.type.h1,
                fontWeight: 500,
                color: tokens.color.text.primary,
                letterSpacing: "-0.025em",
              }}
            >
              Vítej, {firstName}!
            </h1>
            <p
              style={{
                fontSize: tokens.type.body,
                color: tokens.color.text.secondary,
                lineHeight: 1.6,
              }}
            >
              Pojď nastavit workspace pro svůj tým. Zabere to jen minutu.
            </p>
          </div>

          {/* Benefits */}
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: tokens.space.s12,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: tokens.space.s12,
                  fontSize: tokens.type.caption,
                  color: tokens.color.text.secondary,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: tokens.radius.full,
                    background: tokens.color.status.success,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* Divider */}
          <hr
            style={{
              border: "none",
              borderTop: `1px solid ${tokens.color.border.subtle}`,
              margin: 0,
            }}
          />

          {/* Form */}
          <OnboardingForm />
        </div>

        <p
          style={{
            fontSize: tokens.type.micro,
            color: tokens.color.text.muted,
            textAlign: "center",
          }}
        >
          Jako první člen se staneš administrátorem workspace.
        </p>
      </div>
    </div>
  );
}
