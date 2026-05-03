import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { format } from "date-fns";
import { Text } from "@/components/ui/Text";
import { DeskCard } from "@/components/ui/DeskCard";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { DateStrip } from "@/components/dashboard/DateStrip";
import { useReservationsQuery } from "@/features/reservations/useReservationsQuery";
import { useDashboardStore } from "@/store";
import { colors, spacing } from "@team-flow/shared";

export default function DashboardScreen() {
  const { selectedDate, setDate } = useDashboardStore();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data, isLoading, isRefetching, refetch, isError } =
    useReservationsQuery(dateStr);

  // Merge desks with their reservation status
  const desksWithStatus = (data?.desks ?? []).map((desk) => {
    const reservation = data?.reservations.find((r) => r.deskId === desk.id);
    return {
      ...desk,
      status: (reservation ? "booked" : "available") as "booked" | "available",
      user: reservation?.user.name ?? undefined,
      userImage: reservation?.user.image,
    };
  });

  const usersToday = data?.reservations.map((r) => r.user) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Date strip */}
      <DateStrip selectedDate={selectedDate} onDateChange={setDate} />

      {/* Who's in today */}
      {usersToday.length > 0 && (
        <View style={styles.whoIsIn}>
          <Text variant="micro" color="muted">
            IN TODAY
          </Text>
          <View style={styles.avatarRow}>
            {usersToday.slice(0, 8).map((user) => (
              <Avatar
                key={user.id}
                name={user.name ?? undefined}
                src={user.image}
                size={32}
              />
            ))}
            {usersToday.length > 8 && (
              <Text variant="caption" color="secondary">
                +{usersToday.length - 8}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Desk grid */}
      {isLoading ? (
        <SkeletonLoader count={6} />
      ) : isError ? (
        <View style={styles.errorState}>
          <Text variant="body" color="muted">
            Could not load desks. Pull down to retry.
          </Text>
        </View>
      ) : (
        <FlatList
          data={desksWithStatus}
          numColumns={2}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent.primary}
            />
          }
          renderItem={({ item }) => (
            <DeskCard
              name={item.name}
              status={item.status}
              user={item.user}
              userImage={item.userImage}
              style={styles.card}
              onPress={
                item.status === "available"
                  ? () =>
                      router.push({
                        pathname: "/(app)/dashboard/book",
                        params: { deskId: item.id, deskName: item.name, date: dateStr },
                      })
                  : undefined
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="body" color="muted">
                No desks available.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.base,
  },
  whoIsIn: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s12,
    gap: spacing.s8,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s8,
  },
  grid: {
    padding: spacing.s16,
    gap: spacing.s12,
    paddingBottom: spacing.s32,
  },
  row: {
    gap: spacing.s12,
  },
  card: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.s40,
  },
  errorState: {
    alignItems: "center",
    paddingTop: spacing.s40,
    paddingHorizontal: spacing.s24,
  },
});
