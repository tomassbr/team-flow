/**
 * Shared StatusChip / badge component.
 *
 * Displays a colored pill with a status label — used on DeskCards
 * and reservation lists to show available / booked / confirmed states.
 *
 * Works on both React Native and web via react-native-web.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, spacing, radius } from "@team-flow/shared";
import { Text } from "./Text";

type Status = "available" | "booked" | "confirmed" | "released";

export interface StatusChipProps {
  status: Status;
}

const config: Record<Status, { label: string; bg: string; text: string }> = {
  available: {
    label: "Available",
    bg: colors.status.successBg,
    text: colors.status.success,
  },
  booked: {
    label: "Booked",
    bg: colors.accent.primaryBg,
    text: colors.accent.primary,
  },
  confirmed: {
    label: "Confirmed",
    bg: colors.status.successBg,
    text: colors.status.success,
  },
  released: {
    label: "Released",
    bg: colors.surface.level2,
    text: colors.text.muted,
  },
};

export function StatusChip({ status }: StatusChipProps) {
  const { label, bg, text } = config[status];

  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text variant="micro" style={{ color: text }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.s4,
    paddingHorizontal: spacing.s8,
    borderRadius: radius.full,
    alignSelf: "flex-start",
  },
});
