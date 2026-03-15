/**
 * Design token configuration (LIGHT ONLY).
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
      secondary: "var(--token-accent-secondary)",
    },
    status: {
      success: "var(--token-status-success)",
      info: "var(--token-status-info)",
      warning: "var(--token-status-warning)",
      error: "var(--token-status-error)",
    },
  },

  radius: {
    r12: "var(--token-radius-12)",
    r16: "var(--token-radius-16)",
    r20: "var(--token-radius-20)",
    r24: "var(--token-radius-24)",
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
  },

  space: {
    s4: "var(--token-space-4)",
    s8: "var(--token-space-8)",
    s12: "var(--token-space-12)",
    s16: "var(--token-space-16)",
    s24: "var(--token-space-24)",
    s32: "var(--token-space-32)",
    s40: "var(--token-space-40)",
  },

  shadow: {
    e1: "var(--token-shadow-e1)",
    e2: "var(--token-shadow-e2)",
    e3: "var(--token-shadow-e3)",
  },

  gradient: {
    brand: "var(--token-gradient-brand)",
  },
} as const;