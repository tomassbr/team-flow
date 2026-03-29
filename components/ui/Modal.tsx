"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { tokens } from "@/styles/tokens.config";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: tokens.space.s24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: width,
          background: tokens.color.surface.level1,
          borderRadius: tokens.radius.r24,
          boxShadow: tokens.shadow.e3,
          border: `1px solid ${tokens.color.border.subtle}`,
          overflow: "hidden",
        }}
      >
        {title && (
          <div
            style={{
              padding: `${tokens.space.s16} ${tokens.space.s24}`,
              borderBottom: `1px solid ${tokens.color.border.subtle}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                color: tokens.color.text.primary,
                fontSize: tokens.type.h2,
                fontWeight: 500,
                letterSpacing: "var(--token-type-tracking)",
              }}
            >
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: tokens.color.text.muted,
                padding: tokens.space.s4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: tokens.radius.r12,
                fontSize: tokens.type.body,
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ padding: tokens.space.s24 }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
