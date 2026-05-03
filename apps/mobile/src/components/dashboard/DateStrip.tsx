import React from "react";
import { FlatList, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { makeStyleSheet } from "@/theme";
import { toDayAbbrev } from "@/lib/date";
import { addDays, isSameDay, isToday } from "date-fns";

interface DateStripProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

function generateDays(count = 7): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(new Date(), i));
}

const useStyles = makeStyleSheet((theme) => ({
  container: {
    paddingHorizontal: theme.spacing.s16,
    paddingVertical: theme.spacing.s12,
    gap: theme.spacing.s8,
  },
  day: {
    width: 48,
    height: 64,
    borderRadius: theme.radius.r16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: theme.spacing.s4,
    backgroundColor: theme.colors.surface.level1,
  },
  daySelected: {
    backgroundColor: theme.colors.accent.primary,
  },
}));

export function DateStrip({ selectedDate, onDateChange }: DateStripProps) {
  const styles = useStyles();
  const days = generateDays(7);

  return (
    <FlatList
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      keyExtractor={(d) => d.toISOString()}
      renderItem={({ item: date }) => {
        const isSelected = isSameDay(date, selectedDate);
        const isNow = isToday(date);
        return (
          <Pressable onPress={() => onDateChange(date)} style={[styles.day, isSelected && styles.daySelected]}>
            <Text variant="micro" color={isSelected ? "onAccent" : "muted"}>
              {toDayAbbrev(date).toUpperCase()}
            </Text>
            <Text variant="bodyStrong" color={isSelected ? "onAccent" : isNow ? "accent" : "primary"}>
              {date.getDate()}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
