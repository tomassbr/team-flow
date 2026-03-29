import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { tokens } from "@/styles/tokens.config";

interface AppLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  userImage?: string | null;
  appName?: string;
  logoLetters?: string;
}

export function AppLayout({
  children,
  userName,
  userRole,
  userImage,
  appName,
  logoLetters,
}: AppLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: tokens.color.bg.base,
      }}
    >
      <AppHeader
        appName={appName}
        logoLetters={logoLetters}
        userName={userName}
        userRole={userRole}
        userImage={userImage}
      />

      <main
        style={{
          display: "flex",
          padding: `0 ${tokens.space.s40} ${tokens.space.s40}`,
          gap: tokens.space.s40,
        }}
      >
        {children}
      </main>
    </div>
  );
}
