import type { InputHTMLAttributes } from "react";
import { tokens } from "@/styles/tokens.config";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "style"> {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, type = "text", className = "", id, ...props }: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8 }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            color: tokens.color.text.secondary,
            fontSize: tokens.type.caption,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={className}
        style={{
          padding: `${tokens.space.s12} ${tokens.space.s16}`,
          borderRadius: tokens.radius.r16,
          border: `1px solid ${error ? tokens.color.status.error : tokens.color.border.strong}`,
          background: tokens.color.surface.level1,
          color: tokens.color.text.primary,
          fontSize: tokens.type.body,
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            color: tokens.color.status.error,
            fontSize: tokens.type.micro,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
