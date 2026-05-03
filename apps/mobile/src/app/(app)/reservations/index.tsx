import React from "react";
import { View, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { format, addDays } from "date-fns";
import { useQueries } from "@tanstack/react-query";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { api } from "@/lib/apiClient";
import { useAuthStore } from "@/store";
import { colors, spacing } from "@team-flow/shared";

export default function ReservationsScreen() {
  const { userId } = useAuthStore();

  // Fetch reservations for next 7 days
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">My Bookings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {myReservations.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="body" color="muted">
              No upcoming reservations.{"\n"}Go to Desks to book a spot.
            </Text>
          </View>
        ) : (
          myReservations.map((res) => (
            <Card key={res.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardInfo}>
                  <Text variant="bodyStrong">{res.deskName}</Text>
                  <Text variant="caption" color="secondary">
                    {res.date}
                  </Text>
                </View>
                <StatusChip status="available" label={res.status} />
              </View>
            </Card>
          ))
        )}
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
    padding: spacing.s24,
    paddingBottom: spacing.s16,
  },
  list: {
    padding: spacing.s16,
    gap: spacing.s12,
    paddingBottom: spacing.s32,
  },
  card: {
    // override Card padding to allow custom layout
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardInfo: {
    gap: spacing.s4,
  },
  empty: {
    alignItems: "center",
    paddingTop: spacing.s40,
  },
});
