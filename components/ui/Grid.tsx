import type { ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  cols?: number;
  className?: string;
}

export function Grid({ children, cols = 3, className = "" }: GridProps) {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}
