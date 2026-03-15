import type { InputHTMLAttributes } from "react";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
}

export function Input({ placeholder, className = "", type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`rounded-md border border-input-border bg-input-background px-3 py-2 text-foreground placeholder:text-foreground-subtle ${className}`}
      {...props}
    />
  );
}
