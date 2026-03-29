import type { ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";

interface PublicLayoutProps {
  children: ReactNode;
  /** Max width of the centered card. Default: 440px */
  maxWidth?: number;
}

export function PublicLayout({ children, maxWidth = 440 }: PublicLayoutProps) {
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
          maxWidth,
          background: tokens.color.surface.level1,
          borderRadius: tokens.radius.r24,
          boxShadow: tokens.shadow.e3,
          border: `1px solid ${tokens.color.border.subtle}`,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
