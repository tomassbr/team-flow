/**
 * Design token configuration for Smart Office.
 * Map Figma variables here. No hex colors in components — use token names only.
 *
 * Figma: https://www.figma.com/design/jrm80ur02hHd1gRoAhnuRp/Smart-Office?node-id=38-454
 *
 * Usage in components:
 * - Tailwind: bg-primary, text-foreground, border-border, rounded-md
 * - Inline: style={{ color: tokens.color.primary }}
 */

export const tokens = {
  color: {
    // Surfaces
    background: "var(--token-background)",
    "background-elevated": "var(--token-background-elevated)",
    surface: "var(--token-surface)",

    // Text
    foreground: "var(--token-foreground)",
    "foreground-muted": "var(--token-foreground-muted)",
    "foreground-subtle": "var(--token-foreground-subtle)",

    // Brand / Primary
    primary: "var(--token-primary)",
    "primary-hover": "var(--token-primary-hover)",
    "primary-foreground": "var(--token-primary-foreground)",

    // Secondary
    secondary: "var(--token-secondary)",
    "secondary-foreground": "var(--token-secondary-foreground)",

    // Borders
    border: "var(--token-border)",
    "border-muted": "var(--token-border-muted)",

    // Status
    success: "var(--token-success)",
    error: "var(--token-error)",
    warning: "var(--token-warning)",

    // Interactive
    "input-background": "var(--token-input-background)",
    "input-border": "var(--token-input-border)",
  },

  radius: {
    sm: "var(--token-radius-sm)",
    md: "var(--token-radius-md)",
    lg: "var(--token-radius-lg)",
    full: "var(--token-radius-full)",
  },

  spacing: {
    xs: "var(--token-spacing-xs)",
    sm: "var(--token-spacing-sm)",
    md: "var(--token-spacing-md)",
    lg: "var(--token-spacing-lg)",
    xl: "var(--token-spacing-xl)",
  },
} as const;
