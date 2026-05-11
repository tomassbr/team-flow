import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

// Mock data — shown when API is unavailable (dev preview / offline)
const MOCK_DESKS = [
  { id: "mock-1", name: "Desk A1", status: "available" as const },
  { id: "mock-2", name: "Desk A2", status: "booked" as const, user: "Alice Johnson", userImage: null },
  { id: "mock-3", name: "Desk B1", status: "available" as const },
  { id: "mock-4", name: "Desk B2", status: "booked" as const, user: "Bob Chen", userImage: null },
  { id: "mock-5", name: "Desk C1", status: "available" as const },
  { id: "mock-6", name: "Desk C2", status: "available" as const },
];

const MOCK_USERS = [
  { id: "u1", name: "Alice Johnson", image: null },
  { id: "u2", name: "Bob Chen", image: null },
];

export default function DashboardScreen() {
  const { selectedDate, setDate } = useDashboardStore();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data, isLoading, isRefetching, refetch, isError } =
    useReservationsQuery(dateStr);

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

  // Fall back to mock data when API is unavailable
  const usingMock = isError && !data;
  const effectiveDesks = usingMock ? MOCK_DESKS : desksWithStatus;
  const effectiveUsers = usingMock ? MOCK_USERS : usersToday;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Date strip */}
      <DateStrip selectedDate={selectedDate} onDateChange={setDate} />

      {/* Who's in today */}
      {effectiveUsers.length > 0 && (
        <View style={styles.whoIsIn}>
          <Text variant="micro" color="muted">
            IN TODAY
          </Text>
          <View style={styles.avatarRow}>
            {effectiveUsers.slice(0, 8).map((user) => (
              <Avatar
                key={user.id}
                name={user.name ?? undefined}
                src={user.image}
                size={32}
              />
            ))}
            {effectiveUsers.length > 8 && (
              <Text variant="caption" color="secondary">
                +{effectiveUsers.length - 8}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Offline / mock banner */}
      {usingMock && (
        <View style={styles.offlineBanner}>
          <Text variant="micro" color="muted">
            Preview mode — connect to dev server to load real data
          </Text>
        </View>
      )}

      {/* Desk grid */}
      {isLoading ? (
        <SkeletonLoader count={6} />
      ) : (
        <FlatList
          data={effectiveDesks}
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
              userImage={"userImage" in item ? (item.userImage ?? undefined) : undefined}
              style={styles.card}
              onPress={
                item.status === "available" && !usingMock
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
                No desks for this day.
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
  offlineBanner: {
    marginHorizontal: spacing.s16,
    marginBottom: spacing.s8,
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s8,
    backgroundColor: "rgba(99,102,241,0.08)",
    borderRadius: 10,
    alignItems: "center",
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
});
