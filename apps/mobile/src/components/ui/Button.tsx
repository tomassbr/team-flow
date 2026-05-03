import React from "react";
import { Pressable, PressableProps, ActivityIndicator } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Text } from "./Text";
import { makeStyleSheet, useTheme } from "@/theme";

type Variant = "primary" | "secondary" | "gradient";

interface ButtonProps extends PressableProps {
  variant?: Variant;
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const useStyles = makeStyleSheet((theme) => ({
  base: {
    borderRadius: theme.radius.r16,
    paddingVertical: theme.spacing.s12,
    paddingHorizontal: theme.spacing.s24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: theme.spacing.s8,
  },
  primary: {
    backgroundColor: theme.colors.button.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface.level1,
    borderWidth: 1,
    borderColor: theme.colors.border.strong,
  },
  gradient: {
    backgroundColor: theme.colors.accent.primary,
  },
  fullWidth: {
    width: "100%" as const,
  },
  disabled: {
    opacity: 0.5,
  },
}));

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  variant = "primary",
  label,
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[
        animatedStyle,
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style as object,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? colors.text.primary : colors.text.onAccent}
          size="small"
        />
      ) : (
        <Text
          variant="bodyStrong"
          color={variant === "secondary" ? "primary" : "onAccent"}
        >
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}
