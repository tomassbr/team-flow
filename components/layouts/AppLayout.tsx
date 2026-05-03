import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { tokens } from "@/styles/tokens.config";

interface AppLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: "Member" | "Admin";
  userImage?: string | null;
  appName?: string;
  logoLetters?: string;
  variant?: "dashboard" | "admin-page";
}

export function AppLayout({
  children,
  userName,
  userRole,
  userImage,
  appName,
  logoLetters,
  variant = "dashboard",
}: AppLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.gradient.dashboard,
      }}
    >
      <AppHeader
        appName={appName}
        logoLetters={logoLetters}
        userName={userName}
        userRole={userRole}
        userImage={userImage}
        variant={variant}
      />

      <main style={{ padding: `0 ${tokens.space.s40} ${tokens.space.s40}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>{children}</div>
      </main>
    </div>
  );
}
