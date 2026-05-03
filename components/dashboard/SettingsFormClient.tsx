"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { tokens } from "@/styles/tokens.config";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { LockIcon, UploadIcon } from "@/components/icons";
import { updateCompany } from "@/lib/api/company";
import type { Company } from "@/types/domain";


interface SettingsFormClientProps {
  company: Company;
}

export function SettingsFormClient({ company }: SettingsFormClientProps) {
  const router = useRouter();
  const isPro = company.plan === "PRO";

  const [companyName, setCompanyName] = useState(company.name);
  const [autoRelease, setAutoRelease] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isDirty = companyName.trim() !== company.name;

  async function handleSave() {
    const name = companyName.trim();
    if (!name) { setError("Company name is required."); return; }
    setError("");
    try {
      await updateCompany({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  function handleCancel() {
    setCompanyName(company.name);
    setError("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: tokens.space.s32, paddingBottom: 100 }}>

      {/* Page header */}
      <div>
        <h1 style={{ fontSize: tokens.type.h1, fontWeight: 500, color: tokens.color.text.primary, letterSpacing: "-0.025em", marginBottom: tokens.space.s8 }}>
          Workspace Settings
        </h1>
        <p style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary }}>
          Manage your company details, branding, and desk preferences.
        </p>
      </div>

      {/* Section 1: General */}
      <Section>
        <SectionHeader
          title="General"
          subtitle="Basic information about your workspace."
          badge={isPro ? "Pro Plan" : "Free Plan"}
          badgeAccent={isPro}
        />
        <FieldRow label="Company Name" borderBottom>
          <Input
            id="company-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your company name"
            maxLength={100}
            error={error}
          />
        </FieldRow>
        <FieldRow label="Workspace Name">
          <Input
            id="workspace-name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Your workspace name"
            maxLength={100}
          />
        </FieldRow>
      </Section>

      {/* Section 2: Branding — locked for Free plan */}
      <Section>
        <SectionHeader
          title="Branding"
          subtitle="Customize the look and feel of your workspace."
          icon={!isPro ? <LockIcon /> : undefined}
          action={
            !isPro ? (
              <Button variant="gradient" style={{ padding: `${tokens.space.s8} ${tokens.space.s16}`, fontSize: tokens.type.caption }}>
                Upgrade to Pro
              </Button>
            ) : undefined
          }
        />
        <div style={{ position: "relative" }}>
          <FieldRow label="Company Logo" borderBottom disabled={!isPro}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: tokens.space.s12,
                  padding: tokens.space.s24,
                  border: `2px dashed ${tokens.color.border.subtle}`,
                  borderRadius: tokens.radius.r16,
                  background: tokens.color.surface.level2,
                  color: tokens.color.text.muted,
                  cursor: isPro ? "pointer" : "not-allowed",
                  marginBottom: tokens.space.s8,
                }}
              >
                <UploadIcon />
                <span style={{ fontSize: tokens.type.caption }}>Upload logo</span>
              </div>
              <p style={{ fontSize: tokens.type.micro, color: tokens.color.text.muted }}>
                Recommended size: 256×256px.
              </p>
            </div>
          </FieldRow>
          <FieldRow label="Primary Color" disabled={!isPro}>
            <Input
              id="primary-color"
              disabled={!isPro}
              placeholder="#6366F1"
              defaultValue={company.primaryColor ?? ""}
            />
          </FieldRow>
          {/* Glassmorphism lock overlay for Free plan */}
          {!isPro && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background: `${tokens.color.surface.level2}99`,
                backdropFilter: "blur(2px)",
                WebkitBackdropFilter: "blur(2px)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      </Section>

      {/* Section 3: Desk Settings */}
      <Section>
        <SectionHeader title="Desk Settings" subtitle="Configure automated rules for your workspace flow." />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${tokens.space.s20} ${tokens.space.s24}` }}>
          <div>
            <p style={{ fontSize: tokens.type.body, fontWeight: 500, color: tokens.color.text.primary, marginBottom: tokens.space.s4 }}>
              Auto-release desks
            </p>
            <p style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary }}>
              Automatically release desks not checked in by noon.
            </p>
          </div>
          <Toggle checked={autoRelease} onChange={() => setAutoRelease((v) => !v)} />
        </div>
      </Section>

      {/* Sticky bottom bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: tokens.color.surface.level1,
          borderTop: `1px solid ${tokens.color.border.subtle}`,
          padding: `${tokens.space.s16} ${tokens.space.s40}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: tokens.space.s12,
          zIndex: 20,
        }}
      >
        <Button variant="secondary" onClick={handleCancel} disabled={!isDirty}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!isDirty}
          style={saved ? { background: tokens.color.status.success } : undefined}
        >
          {saved ? "Saved!" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── Local layout primitives ──────────���──────────────────────────────────────

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        background: tokens.color.surface.level1,
        borderRadius: tokens.radius.r20,
        border: `1px solid ${tokens.color.border.subtle}`,
        boxShadow: tokens.shadow.e1,
        overflow: "hidden",
      }}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeAccent?: boolean;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

function SectionHeader({ title, subtitle, badge, badgeAccent, icon, action }: SectionHeaderProps) {
  return (
    <div
      style={{
        padding: `${tokens.space.s20} ${tokens.space.s24}`,
        borderBottom: `1px solid ${tokens.color.border.subtle}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: tokens.space.s8, marginBottom: tokens.space.s4 }}>
          <h2 style={{ fontSize: tokens.type.h2, fontWeight: 500, color: tokens.color.text.primary }}>{title}</h2>
          {icon && <span style={{ color: tokens.color.text.muted, display: "flex" }}>{icon}</span>}
        </div>
        <p style={{ fontSize: tokens.type.caption, color: tokens.color.text.secondary }}>{subtitle}</p>
      </div>
      {badge && (
        <span
          style={{
            padding: `${tokens.space.s4} ${tokens.space.s12}`,
            borderRadius: tokens.radius.full,
            fontSize: tokens.type.micro,
            fontWeight: 500,
            background: badgeAccent ? tokens.color.accent.primaryBg : tokens.color.surface.level2,
            color: badgeAccent ? tokens.color.accent.primary : tokens.color.text.muted,
            border: `1px solid ${badgeAccent ? tokens.color.accent.primaryBorder : tokens.color.border.strong}`,
          }}
        >
          {badge}
        </span>
      )}
      {action}
    </div>
  );
}

interface FieldRowProps {
  label: string;
  children: React.ReactNode;
  borderBottom?: boolean;
  disabled?: boolean;
}

function FieldRow({ label, children, borderBottom, disabled }: FieldRowProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: tokens.space.s24,
        padding: `${tokens.space.s20} ${tokens.space.s24}`,
        borderBottom: borderBottom ? `1px solid ${tokens.color.border.subtle}` : "none",
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span style={{ fontSize: tokens.type.caption, fontWeight: 500, color: tokens.color.text.secondary }}>
        {label}
      </span>
      {children}
    </div>
  );
}
