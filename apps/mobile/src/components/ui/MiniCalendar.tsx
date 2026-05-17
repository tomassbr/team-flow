import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  addDays,
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  isSameDay,
  isBefore,
  isToday,
} from "date-fns";
import { colors, spacing, radius } from "@team-flow/shared";

interface MiniCalendarProps {
  selectedDate: Date;
  minDate?: Date;
  onSelect: (date: Date) => void;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function buildCalendarDays(viewMonth: Date): Date[] {
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = gridStart;
  while (d <= monthEnd || days.length % 7 !== 0) {
    days.push(d);
    d = addDays(d, 1);
    if (days.length >= 42) break;
  }
  return days;
}

export function MiniCalendar({ selectedDate, minDate, onSelect }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(new Date(selectedDate));
  const days = buildCalendarDays(viewMonth);
  const today = new Date();

  return (
    <View>
      {/* Month nav */}
      <View style={styles.monthNav}>
        <Pressable
          style={styles.navBtn}
          onPress={() => setViewMonth((m) => subMonths(m, 1))}
        >
          <Ionicons name="chevron-back" size={18} color={colors.text.secondary} />
        </Pressable>
        <Text style={styles.monthLabel}>{format(viewMonth, "MMMM yyyy")}</Text>
        <Pressable
          style={styles.navBtn}
          onPress={() => setViewMonth((m) => addMonths(m, 1))}
        >
          <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((d) => (
          <View key={d} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {days.map((day, idx) => {
          const isCurrentMonth = day.getMonth() === viewMonth.getMonth();
          const isSelected = isSameDay(day, selectedDate);
          const isDisabled =
            (minDate != null && isBefore(day, minDate) && !isSameDay(day, minDate)) ||
            (isBefore(day, today) && !isSameDay(day, today));
          const isTodayDate = isToday(day);

          return (
            <Pressable
              key={idx}
              style={[
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isTodayDate && !isSelected && styles.dayCellToday,
              ]}
              onPress={() => {
                if (!isDisabled) onSelect(day);
              }}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.dayText,
                  !isCurrentMonth && styles.dayTextOtherMonth,
                  isDisabled && styles.dayTextDisabled,
                  isTodayDate && !isSelected && styles.dayTextToday,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {day.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.s8,
    paddingBottom: spacing.s12,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface.level2,
    alignItems: "center",
    justifyContent: "center",
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  weekRow: {
    flexDirection: "row",
    paddingBottom: spacing.s8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.muted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  dayCellSelected: {
    backgroundColor: colors.accent.primary,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.accent.primaryBorder,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.primary,
  },
  dayTextOtherMonth: {
    color: colors.border.strong,
  },
  dayTextDisabled: {
    color: colors.border.strong,
  },
  dayTextToday: {
    color: colors.accent.primary,
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
