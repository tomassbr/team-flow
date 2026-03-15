import type { ReactNode } from "react";
import { tokens } from "@/styles/tokens.config";

interface AvatarProps {
  src?: string | null;
  alt: string;
  name: string;
  size?: 56 | 40;
  badge?: ReactNode;
  showName?: boolean;
}

export function Avatar({
  src,
  alt,
  name,
  size = 56,
  badge,
  showName = true,
}: AvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  const circle = (
    <div style={{ position: "relative" }}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: tokens.radius.full,
            overflow: "hidden",
            background: tokens.color.accent.secondary,
            color: tokens.color.text.onAccent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size === 56 ? "var(--token-type-body)" : "var(--token-type-caption)",
            fontWeight: 500,
            boxShadow: tokens.shadow.e1,
          }}
        >
          {src ? (
            <img
              src={src}
              alt={alt}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initial
          )}
        </div>
        {badge && (
          <div
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 20,
              height: 20,
              borderRadius: tokens.radius.full,
              background: tokens.color.surface.level1,
              border: `1px solid ${tokens.color.border.subtle}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: tokens.shadow.e1,
            }}
          >
            {badge}
          </div>
        )}
    </div>
  );

  if (!showName) {
    return circle;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: tokens.space.s12,
      }}
    >
      {circle}
      <span
        style={{
          color: tokens.color.text.secondary,
          fontSize: tokens.type.micro,
          fontWeight: 400,
        }}
      >
        {name}
      </span>
    </div>
  );
}
