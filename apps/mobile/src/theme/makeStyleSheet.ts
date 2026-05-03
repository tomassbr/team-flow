import { useMemo } from "react";
import { StyleSheet } from "react-native";
import type { ImageStyle, TextStyle, ViewStyle } from "react-native";
import type { Theme } from "@team-flow/shared";
import { useTheme } from "./ThemeProvider";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function makeStyleSheet<T extends NamedStyles<T>>(
  factory: (theme: Theme) => T
) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(
      () => StyleSheet.create(factory(theme)) as T,
      [theme]
    );
  };
}
