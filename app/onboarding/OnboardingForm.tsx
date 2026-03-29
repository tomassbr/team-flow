"use client";

import { useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { tokens } from "@/styles/tokens.config";

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function OnboardingForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { update } = useSession();
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Něco se pokazilo. Zkus to znovu.");
        return;
      }

      // Refresh the JWT session so it picks up the new companyId from DB.
      // This triggers trigger === "update" in the jwt callback.
      await update();

      router.push("/dashboard");
    } catch {
      setError("Nepodařilo se připojit k serveru. Zkontroluj připojení.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: tokens.space.s24 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s8 }}>
        <label
          htmlFor="company-name"
          style={{
            fontSize: tokens.type.caption,
            fontWeight: 500,
            color: tokens.color.text.primary,
          }}
        >
          Název firmy nebo týmu
        </label>
        <Input
          id="company-name"
          name="name"
          type="text"
          placeholder="např. Acme s.r.o."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          autoComplete="organization"
          autoFocus
          required
        />
        <p
          style={{
            fontSize: tokens.type.micro,
            color: tokens.color.text.muted,
          }}
        >
          Název bude viditelný pro všechny členy týmu.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: `${tokens.space.s12} ${tokens.space.s16}`,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.25)",
            borderRadius: tokens.radius.r16,
            color: tokens.color.status.error,
            fontSize: tokens.type.caption,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || name.trim().length === 0}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: tokens.space.s12,
          padding: `${tokens.space.s16} ${tokens.space.s24}`,
          background: "#0F172A",
          color: tokens.color.text.onAccent,
          border: "none",
          borderRadius: tokens.radius.r16,
          fontSize: tokens.type.body,
          fontWeight: 500,
          cursor: isPending || name.trim().length === 0 ? "not-allowed" : "pointer",
          opacity: isPending || name.trim().length === 0 ? 0.5 : 1,
          boxShadow:
            "0 0 16px rgba(99, 102, 241, 0.5), 0 0 32px rgba(34, 211, 238, 0.4), 0 0 48px rgba(79, 70, 229, 0.35)",
          transition: "opacity 0.15s",
        }}
      >
        {isPending ? "Vytvářím workspace…" : "Vytvořit workspace"}
        {!isPending && (
          <span
            style={{
              color: tokens.color.accent.secondary,
              display: "inline-flex",
            }}
          >
            <ArrowRightIcon />
          </span>
        )}
      </button>
    </form>
  );
}
