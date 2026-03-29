/**
 * Design token configuration (LIGHT ONLY).
 * Source of truth: styles/tokens.css — synced from Figma.
 * Components must NOT use hex colors directly — use token names only.
 */
export const tokens = {
  color: {
    bg: {
      base: "var(--token-background)",
      canvas: "var(--token-background-canvas)",
    },
    surface: {
      level1: "var(--token-surface-1)",
      level2: "var(--token-surface-2)",
      glassTint: "var(--token-surface-glass)",
      elevated: "var(--token-surface-elevated)",
    },
    text: {
      primary: "var(--token-text-primary)",
      secondary: "var(--token-text-secondary)",
      muted: "var(--token-text-muted)",
      onAccent: "var(--token-text-on-accent)",
    },
    border: {
      subtle: "var(--token-border-subtle)",
      strong: "var(--token-border-strong)",
    },
    accent: {
      primary: "var(--token-accent-primary)",
      primaryBg: "var(--token-accent-primary-bg)",
      primaryBorder: "var(--token-accent-primary-border)",
      secondary: "var(--token-accent-secondary)",
      secondaryBg: "var(--token-accent-secondary-bg)",
      secondaryBorder: "var(--token-accent-secondary-border)",
    },
    button: {
      primary: "var(--token-button-primary)",
    },
    status: {
      success: "var(--token-status-success)",
      successBg: "var(--token-status-success-bg)",
      successBorder: "var(--token-status-success-border)",
      info: "var(--token-status-info)",
      warning: "var(--token-status-warning)",
      error: "var(--token-status-error)",
    },
  },

  space: {
    s4: "var(--token-space-4)",
    s8: "var(--token-space-8)",
    s12: "var(--token-space-12)",
    s16: "var(--token-space-16)",
    s20: "var(--token-space-20)",
    s24: "var(--token-space-24)",
    s32: "var(--token-space-32)",
    s40: "var(--token-space-40)",
  },

  radius: {
    r12: "var(--token-radius-12)",
    r16: "var(--token-radius-16)",
    r20: "var(--token-radius-20)",
    r24: "var(--token-radius-24)",
    r28: "var(--token-radius-28)",
    r32: "var(--token-radius-32)",
    full: "var(--token-radius-full)",
  },

  type: {
    display: "var(--token-type-display)",
    h1: "var(--token-type-h1)",
    h2: "var(--token-type-h2)",
    body: "var(--token-type-body)",
    caption: "var(--token-type-caption)",
    micro: "var(--token-type-micro)",
  },

  surface: {
    booked: "var(--token-surface-booked)",
    elevated: "var(--token-surface-elevated)",
  },

  shadow: {
    e1: "var(--token-shadow-e1)",
    e2: "var(--token-shadow-e2)",
    e3: "var(--token-shadow-e3)",
  },

  gradient: {
    brand: "var(--token-gradient-brand)",
    item: "var(--token-gradient-item)",
    dashboard: "var(--token-gradient-dashboard)",
  },
} as const;
