interface InputProps {
  placeholder?: string;
  className?: string;
}

export function Input({ placeholder, className = "" }: InputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={`rounded-md border border-input-border bg-input-background px-3 py-2 text-foreground placeholder:text-foreground-subtle ${className}`}
    />
  );
}
