import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "./Text";
import { colors, spacing, radius, rnShadows } from "@team-flow/shared";

interface NavHeaderProps {
  title: string;
  onBack?: () => void;
  /** Ionicons name for the optional right action button */
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
}

/**
 * Mobile navigation header mirroring the Figma NavHeader component:
 * 44px touch-target circular icon buttons, absolutely centered title.
 */
export function NavHeader({ title, onBack, actionIcon, onAction }: NavHeaderProps) {
  return (
    <View style={styles.container}>
      <Text variant="h2" style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconBtn} hitSlop={4}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
      ) : (
        <View style={styles.iconBtnSpacer} />
      )}

      {actionIcon && onAction ? (
        <Pressable onPress={onAction} style={styles.iconBtn} hitSlop={4}>
          <Ionicons name={actionIcon} size={20} color={colors.text.primary} />
        </Pressable>
      ) : (
        <View style={styles.iconBtnSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.s16,
    paddingVertical: 6,
    minHeight: 56,
  },
  title: {
    position: "absolute",
    left: spacing.s16 + 44,
    right: spacing.s16 + 44,
    textAlign: "center",
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface.level1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: "center",
    justifyContent: "center",
    ...rnShadows.e1,
  },
  iconBtnSpacer: {
    width: 44,
    height: 44,
  },
});
