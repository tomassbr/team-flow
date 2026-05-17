import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { toDayAbbrev } from "@/lib/date";
import { addDays, isSameDay } from "date-fns";
import { colors, spacing, radius } from "@team-flow/shared";

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

function generateDays(count = 7): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(new Date(), i));
}

export function DateStrip({ selectedDate, onDateChange }: DateStripProps) {
  const days = generateDays(7);

  return (
    <View style={styles.container}>
      {days.map((date) => {
        const isSelected = isSameDay(date, selectedDate);
        return (
          <Pressable
            key={date.toISOString()}
            onPress={() => onDateChange(date)}
            style={[styles.day, isSelected && styles.daySelected]}
          >
            <Text
              variant="micro"
              style={[styles.label, isSelected && styles.labelSelected]}
            >
              {toDayAbbrev(date).toUpperCase()}
            </Text>
            <Text
              variant="bodyStrong"
              style={[styles.number, isSelected && styles.numberSelected]}
            >
              {date.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    gap: spacing.s4,
  },
  day: {
    flex: 1,
    height: 46,
    borderRadius: radius.r12,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s4,
  },
  daySelected: {
    backgroundColor: colors.accent.primary,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text.muted,
    lineHeight: 12,
  },
  labelSelected: {
    color: "rgba(255,255,255,0.7)",
  },
  number: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    lineHeight: 20,
  },
  numberSelected: {
    color: "#FFFFFF",
  },
});
