export interface ThemeColors {
  bg: {
    base: string;
    canvas: string;
  };
  surface: {
    level1: string;
    level2: string;
    glassTint: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    onAccent: string;
  };
  border: {
    subtle: string;
    strong: string;
  };
  accent: {
    primary: string;
    primaryBg: string;
    primaryBorder: string;
    secondary: string;
    secondaryBg: string;
    secondaryBorder: string;
  };
  button: {
    primary: string;
  };
  status: {
    success: string;
    successBg: string;
    successBorder: string;
    info: string;
    warning: string;
    error: string;
  };
}

export interface ThemeSpacing {
  s4: number;
  s8: number;
  s12: number;
  s16: number;
  s20: number;
  s24: number;
  s32: number;
  s40: number;
}

export interface ThemeRadius {
  r12: number;
  r16: number;
  r20: number;
  r24: number;
  r28: number;
  r32: number;
  full: number;
}

export interface ThemeTypography {
  display: { fontSize: number; fontWeight: "400" | "500" | "600" | "700"; letterSpacing?: number };
  h1: { fontSize: number; fontWeight: "400" | "500" | "600" | "700"; letterSpacing?: number };
  h2: { fontSize: number; fontWeight: "400" | "500" | "600" | "700"; letterSpacing?: number };
  body: { fontSize: number; fontWeight: "400" | "500" | "600" | "700" };
  bodyStrong: { fontSize: number; fontWeight: "400" | "500" | "600" | "700" };
  caption: { fontSize: number; fontWeight: "400" | "500" | "600" | "700" };
  micro: { fontSize: number; fontWeight: "400" | "500" | "600" | "700" };
}

export interface ThemeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeShadows {
  e1: ThemeShadow;
  e2: ThemeShadow;
  e3: ThemeShadow;
}

/** The complete theme contract. Every theme must satisfy this shape. */
export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
  shadows: ThemeShadows;
}
