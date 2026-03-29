import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { tokens } from "@/styles/tokens.config";

interface AdminLayoutProps {
  children: ReactNode;
  userName: string;
  userRole: string;
  appName?: string;
  logoLetters?: string;
}

export function AdminLayout({
  children,
  userName,
  userRole,
  appName,
  logoLetters,
}: AdminLayoutProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        userName={userName}
        userRole={userRole}
        appName={appName}
        logoLetters={logoLetters}
      />

      {/* Vertical divider */}
      <div
        style={{
          width: 1,
          background: tokens.color.border.subtle,
          flexShrink: 0,
        }}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          background: tokens.color.bg.base,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Accent top edge — #6366F1 as in Figma Workspace settings */}
        <div
          style={{
            height: 3,
            background: tokens.color.accent.primary,
            flexShrink: 0,
          }}
        />

        <main
          style={{
            flex: 1,
            padding: tokens.space.s40,
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
