import { signIn } from "@/auth";
import { Logo } from "@/components/ui/Logo";
import { Input } from "@/components/ui/Input";
import { tokens } from "@/styles/tokens.config";

const IS_DEV = process.env.NODE_ENV === "development";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const OAUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Přihlášení přes Google selhalo. Zkus to znovu.",
  OAuthCallback: "Chyba při zpracování odpovědi od Google.",
  OAuthCreateAccount: "Nepodařilo se vytvořit účet. Kontaktuj podporu.",
  OAuthAccountNotLinked:
    "Tento e-mail je již přihlášen jiným způsobem. Přihlas se původním způsobem.",
  CredentialsSignin: "Neplatné přihlašovací údaje.",
  Default: "Něco se pokazilo. Zkus to znovu.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error
    ? (OAUTH_ERRORS[params.error] ?? OAUTH_ERRORS.Default)
    : null;

  // Validate callbackUrl is same-origin to prevent open redirect.
  const rawCallback = params.callbackUrl ?? "";
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";

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
          maxWidth: 400,
          background: tokens.color.surface.level1,
          borderRadius: tokens.radius.r24,
          boxShadow: tokens.shadow.e3,
          padding: tokens.space.s40,
          display: "flex",
          flexDirection: "column",
          gap: tokens.space.s32,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: tokens.space.s16,
            textAlign: "center",
          }}
        >
          <Logo letters="SO" size={48} />
          <div>
            <h1
              style={{
                fontSize: tokens.type.h1,
                fontWeight: 500,
                color: tokens.color.text.primary,
                letterSpacing: "-0.025em",
                marginBottom: tokens.space.s8,
              }}
            >
              Team Flow
            </h1>
            <p
              style={{
                fontSize: tokens.type.caption,
                color: tokens.color.text.secondary,
              }}
            >
              Přihlas se a spravuj rezervace svého týmu.
            </p>
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div
            role="alert"
            style={{
              padding: `${tokens.space.s12} ${tokens.space.s16}`,
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              borderRadius: tokens.radius.r16,
              color: tokens.color.status.error,
              fontSize: tokens.type.caption,
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Google sign-in */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: tokens.space.s12,
              padding: `${tokens.space.s16} ${tokens.space.s24}`,
              background: tokens.color.surface.level1,
              border: `1px solid ${tokens.color.border.strong}`,
              borderRadius: tokens.radius.r16,
              fontSize: tokens.type.body,
              fontWeight: 500,
              color: tokens.color.text.primary,
              cursor: "pointer",
              boxShadow: tokens.shadow.e1,
            }}
          >
            <GoogleIcon />
            Pokračovat přes Google
          </button>
        </form>

        {/* Dev-only credentials form — never rendered in production */}
        {IS_DEV && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: tokens.space.s16 }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: tokens.space.s12 }}
            >
              <hr
                style={{
                  flex: 1,
                  border: "none",
                  borderTop: `1px solid ${tokens.color.border.subtle}`,
                }}
              />
              <span
                style={{
                  fontSize: tokens.type.micro,
                  color: tokens.color.text.muted,
                  whiteSpace: "nowrap",
                }}
              >
                Dev prostředí
              </span>
              <hr
                style={{
                  flex: 1,
                  border: "none",
                  borderTop: `1px solid ${tokens.color.border.subtle}`,
                }}
              />
            </div>

            <form
              style={{ display: "flex", flexDirection: "column", gap: tokens.space.s12 }}
              action={async (formData: FormData) => {
                "use server";
                await signIn("credentials", {
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  redirectTo: callbackUrl,
                });
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8 }}
              >
                <label
                  htmlFor="dev-email"
                  style={{
                    fontSize: tokens.type.caption,
                    fontWeight: 500,
                    color: tokens.color.text.secondary,
                  }}
                >
                  Email
                </label>
                <Input
                  id="dev-email"
                  name="email"
                  type="email"
                  placeholder="dev@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8 }}
              >
                <label
                  htmlFor="dev-password"
                  style={{
                    fontSize: tokens.type.caption,
                    fontWeight: 500,
                    color: tokens.color.text.secondary,
                  }}
                >
                  Heslo
                </label>
                <Input
                  id="dev-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: `${tokens.space.s12} ${tokens.space.s16}`,
                  background: tokens.color.surface.level2,
                  border: `1px solid ${tokens.color.border.strong}`,
                  borderRadius: tokens.radius.r16,
                  fontSize: tokens.type.caption,
                  fontWeight: 500,
                  color: tokens.color.text.secondary,
                  cursor: "pointer",
                }}
              >
                Přihlásit se (dev)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
