import React from "react";
import { View, ViewProps } from "react-native";
import { makeStyleSheet } from "@/theme";

type Variant = "default" | "elevated";

interface CardProps extends ViewProps {
  variant?: Variant;
  padding?: "sm" | "md" | "lg";
}

const useStyles = makeStyleSheet((theme) => ({
  base: {
    backgroundColor: theme.colors.surface.level1,
    borderRadius: theme.radius.r20,
    padding: theme.spacing.s16,
    ...theme.shadows.e1,
  },
  elevated: {
    backgroundColor: theme.colors.surface.elevated,
    ...theme.shadows.e2,
  },
  paddingSm: { padding: theme.spacing.s12 },
  paddingMd: { padding: theme.spacing.s16 },
  paddingLg: { padding: theme.spacing.s24 },
}));

export function Card({ variant = "default", padding = "md", style, children, ...props }: CardProps) {
  const styles = useStyles();
  return (
    <View
      style={[
        styles.base,
        variant === "elevated" && styles.elevated,
        styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
