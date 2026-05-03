/**
 * Shared Text component — works on both React Native and web (via react-native-web).
 *
 * On mobile:  renders a native <Text> element via React Native runtime
 * On web:     `react-native` is aliased to `react-native-web` in next.config.ts,
 *             so this renders as a <span> with equivalent styles.
 *
 * Usage:
 *   import { Text } from "@team-flow/ui";
 *   <Text variant="h1" color="secondary">Hello</Text>
 */
import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { colors, typography } from "@team-flow/shared";

type Variant = keyof typeof typography;
type Color = "primary" | "secondary" | "muted" | "onAccent" | "accent";

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: Color;
}

const colorMap: Record<Color, string> = {
  primary: colors.text.primary,
  secondary: colors.text.secondary,
  muted: colors.text.muted,
  onAccent: colors.text.onAccent,
  accent: colors.accent.primary,
};

export function Text({ variant = "body", color = "primary", style, ...props }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colorMap[color] }, style]}
      {...props}
    />
  );
}
