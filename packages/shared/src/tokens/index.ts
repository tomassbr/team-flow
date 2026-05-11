export const colors = {
  bg: {
    base: "#F3F5F9",
    canvas: "#F3F5F9",
  },
  surface: {
    level1: "#FFFFFF",
    level2: "#F8FAFC",
    glassTint: "rgba(241, 245, 249, 0.8)",
    elevated: "#EEF4FE",
  },
  text: {
    primary: "#0F172A",
    secondary: "#475569",
    muted: "#64748B",
    onAccent: "#FFFFFF",
  },
  border: {
    subtle: "#F1F5F9",
    strong: "#CBD5E1",
  },
  accent: {
    primary: "#6366F1",
    primaryBg: "rgba(99, 102, 241, 0.1)",
    primaryBorder: "rgba(99, 102, 241, 0.2)",
    secondary: "#06B6D4",
    secondaryBg: "rgba(6, 182, 212, 0.15)",
    secondaryBorder: "rgba(6, 182, 212, 0.3)",
  },
  button: {
    primary: "#0F172A",
  },
  status: {
    success: "#10B981",
    successBg: "rgba(16, 185, 129, 0.15)",
    successBorder: "rgba(16, 185, 129, 0.3)",
    info: "#3B82F6",
    warning: "#F59E0B",
    error: "#EF4444",
  },
} as const;

/**
 * Spacing — in pixels (React Native uses unitless numbers, web uses rem).
 * Web: multiply by 0.0625 to convert to rem (e.g. 16 → 1rem).
 * Mobile: use directly in StyleSheet (e.g. padding: spacing.s16).
 */
export const spacing = {
  s4: 4,
  s8: 8,
  s12: 12,
  s16: 16,
  s20: 20,
  s24: 24,
  s32: 32,
  s40: 40,
} as const;

/** Border radius — in pixels */
export const radius = {
  r12: 12,
  r16: 16,
  r20: 20,
  r24: 24,
  r28: 28,
  r32: 32,
  full: 9999,
} as const;

/**
 * Typography scale.
 * fontSize in pixels, fontWeight as a string (React Native requirement).
 */
export const typography = {
  display: { fontSize: 30, fontWeight: "500" as const, letterSpacing: -0.75 },
  h1: { fontSize: 24, fontWeight: "500" as const, letterSpacing: -0.6 },
  h2: { fontSize: 20, fontWeight: "500" as const, letterSpacing: -0.5 },
  body: { fontSize: 16, fontWeight: "400" as const },
  bodyStrong: { fontSize: 16, fontWeight: "500" as const },
  caption: { fontSize: 14, fontWeight: "400" as const },
  micro: { fontSize: 12, fontWeight: "500" as const },
} as const;

/**
 * Gradient definice — jediný zdroj pravdy pro obě platformy.
 *
 * Web:    používej `gradient.brand.css` / `gradient.dashboard.css` přímo jako background string.
 * Mobile: používej `gradient.brand.colors` / `gradient.deskBooked.colors` v LinearGradient.
 */
export const gradient = {
  /** Primární CTA gradient (tlačítka, hero akcenty) */
  brand: {
    css: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
    colors: ["#6366F1", "#06B6D4"] as [string, string],
  },
  /** Gradient pro rezervovanou desk kartu */
  deskBooked: {
    css: "linear-gradient(135deg, #C6D1FF 0%, #CFFAFF 50%, #FFFFFF 100%)",
    colors: ["#C6D1FF", "#CFFAFF", "#FFFFFF"] as [string, string, string],
  },
  /** Jemné pozadí dashboardu */
  dashboard: {
    css: "linear-gradient(180deg, #EEF2FF 0%, #F3F5F9 50%)",
    colors: ["#EEF2FF", "#F3F5F9"] as [string, string],
  },
} as const;

/** Elevation shadows (web CSS string format; mobile uses shadowOffset/elevation) */
export const shadows = {
  e1: "0 1px 2px 0 rgba(0,0,0,0.05)",
  e2: "0 2px 12px 0 rgba(0,0,0,0.02)",
  e3: "0 8px 40px 0 rgba(0,0,0,0.03)",
} as const;

/** Shadow props for React Native StyleSheet (shadowColor/offset/opacity/radius + elevation). */
export const rnShadows = {
  e1: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  e2: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  e3: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
