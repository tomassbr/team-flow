import React from "react";
import { View } from "react-native";
import { Text } from "./Text";
import { makeStyleSheet } from "@/theme";
import type { DeskStatus } from "@team-flow/shared";

interface StatusChipProps {
  status: DeskStatus;
  label?: string;
}

const useStyles = makeStyleSheet((theme) => ({
  base: {
    borderRadius: theme.radius.full,
    paddingVertical: theme.spacing.s4,
    paddingHorizontal: theme.spacing.s8,
    alignSelf: "flex-start" as const,
  },
  available: {
    backgroundColor: theme.colors.accent.primaryBg,
    borderWidth: 1,
    borderColor: theme.colors.accent.primaryBorder,
  },
  booked: {
    backgroundColor: theme.colors.surface.level2,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
}));

export function StatusChip({ status, label }: StatusChipProps) {
  const styles = useStyles();
  const isBooked = status === "booked";
  return (
    <View style={[styles.base, isBooked ? styles.booked : styles.available]}>
      <Text variant="micro" color={isBooked ? "secondary" : "accent"}>
        {label ?? (isBooked ? "Booked" : "Available")}
      </Text>
    </View>
  );
}
