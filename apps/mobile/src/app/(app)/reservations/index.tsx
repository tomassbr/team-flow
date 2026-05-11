import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { useQueries } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { api } from "@/lib/apiClient";
import { useAuthStore } from "@/store";
import { colors, spacing, radius, rnShadows } from "@team-flow/shared";

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE");
}

function daySubLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return format(d, "EEE, d MMM");
}

export default function ReservationsScreen() {
  const { userId } = useAuthStore();

  const dates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(new Date(), i), "yyyy-MM-dd")
  );

  const results = useQueries({
    queries: dates.map((date) => ({
      queryKey: ["reservations", date],
      queryFn: () => api.reservations.list(date),
      staleTime: 30_000,
    })),
  });

  // "This Week" — obsazenost po dnech
  const weekStats = dates.slice(0, 5).map((date, i) => {
    const data = results[i].data;
    const total = data?.desks.length ?? 0;
    const booked = data?.reservations.length ?? 0;
    const pct = total > 0 ? Math.round((booked / total) * 100) : 0;
    return { date, total, booked, pct, isLoaded: !!data };
  });

  const myReservations = results
    .flatMap((r, i) => {
      if (!r.data) return [];
      const mine = r.data.reservations.filter((res) => res.userId === userId);
      return mine.map((res) => {
        const desk = r.data!.desks.find((d) => d.id === res.deskId);
        return { ...res, deskName: desk?.name ?? "Unknown desk", date: dates[i] };
      });
    })
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text variant="h1">My Bookings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* This Week panel */}
        <View style={styles.weekPanel}>
          <View style={styles.weekHeader}>
            <Text variant="bodyStrong">This Week</Text>
          </View>
          {weekStats.map(({ date, booked, total, pct }) => (
            <View key={date} style={styles.weekRow}>
              <View style={styles.weekDayCol}>
                <Text variant="bodyStrong" style={styles.weekDay}>
                  {dayLabel(date)}
                </Text>
                <Text variant="micro" color="secondary">
                  {daySubLabel(date)}
                </Text>
              </View>
              <View style={styles.weekBarCol}>
                <View style={styles.weekBarBg}>
                  <View style={[styles.weekBarFill, { width: `${pct}%` as `${number}%` }]} />
                </View>
              </View>
              <Text
                variant="micro"
                style={[
                  styles.weekPct,
                  pct >= 80 ? styles.weekPctHigh : pct > 0 ? styles.weekPctMid : styles.weekPctEmpty,
                ]}
              >
                {pct > 0 ? `${pct}% Full` : "0% Full"}
              </Text>
            </View>
          ))}
        </View>

        {/* Moje rezervace */}
        <View style={styles.section}>
          <Text variant="bodyStrong" style={styles.sectionTitle}>My Reservations</Text>
          {myReservations.length === 0 ? (
            <View style={styles.empty}>
              <Text variant="body" color="muted" style={styles.emptyText}>
                No upcoming reservations.{"\n"}Go to Desks to book a spot.
              </Text>
            </View>
          ) : (
            myReservations.map((res) => (
              <View key={res.id} style={styles.reservationCard}>
                <View style={styles.reservationLeft}>
                  <Ionicons name="desktop-outline" size={18} color={colors.text.muted} />
                  <View style={styles.reservationInfo}>
                    <Text variant="bodyStrong">{res.deskName}</Text>
                    <Text variant="micro" color="secondary">{daySubLabel(res.date)}</Text>
                  </View>
                </View>
                <View style={styles.reservedBadge}>
                  <Text variant="micro" style={styles.reservedBadgeText}>Reserved</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  header: {
    paddingHorizontal: spacing.s24,
    paddingTop: spacing.s8,
    paddingBottom: spacing.s16,
  },
  scroll: {
    padding: spacing.s16,
    gap: spacing.s16,
    paddingBottom: spacing.s40,
  },
  // This Week panel
  weekPanel: {
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r24,
    padding: spacing.s20,
    gap: spacing.s12,
    ...rnShadows.e2,
  },
  weekHeader: {
    marginBottom: spacing.s4,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s12,
  },
  weekDayCol: {
    width: 90,
    gap: 2,
  },
  weekDay: {
    fontSize: 14,
  },
  weekBarCol: {
    flex: 1,
  },
  weekBarBg: {
    height: 6,
    backgroundColor: colors.surface.level2,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  weekBarFill: {
    height: "100%",
    backgroundColor: colors.accent.primary,
    borderRadius: radius.full,
  },
  weekPct: {
    width: 52,
    textAlign: "right",
    fontWeight: "500",
  },
  weekPctHigh: {
    color: colors.status.error,
  },
  weekPctMid: {
    color: colors.accent.primary,
  },
  weekPctEmpty: {
    color: colors.text.muted,
  },
  // My reservations
  section: {
    gap: spacing.s8,
  },
  sectionTitle: {
    marginBottom: spacing.s4,
  },
  reservationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r16,
    padding: spacing.s16,
    ...rnShadows.e1,
  },
  reservationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s12,
    flex: 1,
  },
  reservationInfo: {
    gap: spacing.s4,
  },
  reservedBadge: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: radius.full,
    backgroundColor: colors.accent.primaryBg,
    borderWidth: 1,
    borderColor: colors.accent.primaryBorder,
  },
  reservedBadgeText: {
    color: colors.accent.primary,
  },
  empty: {
    alignItems: "center",
    paddingVertical: spacing.s32,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 24,
  },
});
