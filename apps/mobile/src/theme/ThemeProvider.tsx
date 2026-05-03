import React, { createContext, useContext } from "react";
import type { Theme } from "@team-flow/shared";
import { lightTheme } from "@team-flow/shared";

const ThemeContext = createContext<Theme>(lightTheme);

interface ThemeProviderProps {
  children: React.ReactNode;
  /** Override theme (e.g. for dark mode or testing) */
  theme?: Theme;
}

export function ThemeProvider({ children, theme = lightTheme }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
