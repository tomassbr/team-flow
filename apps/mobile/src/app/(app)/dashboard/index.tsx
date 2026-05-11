import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { format } from "date-fns";
import { Text } from "@/components/ui/Text";
import { DeskCard } from "@/components/ui/DeskCard";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { DateStrip } from "@/components/dashboard/DateStrip";
import { useReservationsQuery } from "@/features/reservations/useReservationsQuery";
import { useDashboardStore, useAuthStore } from "@/store";
import { colors, spacing, radius, gradient } from "@team-flow/shared";

type Filter = "all" | "available";

// Mock data — zobrazí se při nedostupném API (dev preview / offline)
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
  const { role } = useAuthStore();
  const isAdmin = role === "ADMIN";

  const [filter, setFilter] = useState<Filter>("all");
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

  const usingMock = isError && !data;
  const allDesks = usingMock ? MOCK_DESKS : desksWithStatus;
  const effectiveDesks =
    filter === "available"
      ? allDesks.filter((d) => d.status === "available")
      : allDesks;
  const effectiveUsers = usingMock ? MOCK_USERS : usersToday;

  // Přidáme "Add New Desk" položku na konec gridu pro adminy
  type AddNewItem = { id: "__add_new__"; isAddNew: true };
  type DeskItem = (typeof effectiveDesks)[number];
  const gridData: (DeskItem | AddNewItem)[] = isAdmin && !usingMock
    ? [...effectiveDesks, { id: "__add_new__", isAddNew: true as const }]
    : effectiveDesks;

  return (
    <LinearGradient
      colors={gradient.dashboard.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.5 }}
      style={styles.gradientBg}
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* Date strip */}
        <DateStrip selectedDate={selectedDate} onDateChange={setDate} />

        {/* Who's in today */}
        {effectiveUsers.length > 0 && (
          <View style={styles.whoIsIn}>
            <Text variant="micro" color="muted">IN TODAY</Text>
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

        {/* Filter: All / Available */}
        <View style={styles.filterRow}>
          <Text variant="bodyStrong">Workspace</Text>
          <View style={styles.filterPills}>
            {(["all", "available"] as Filter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.pill, filter === f && styles.pillActive]}
              >
                <Text
                  variant="caption"
                  style={filter === f ? styles.pillTextActive : styles.pillText}
                >
                  {f === "all" ? "All" : "Available"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Desk grid */}
        {isLoading ? (
          <SkeletonLoader count={6} />
        ) : (
          <FlatList
            key={filter}
            data={gridData}
            numColumns={2}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            style={styles.flatList}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor={colors.accent.primary}
              />
            }
            renderItem={({ item }) => {
              if ("isAddNew" in item) {
                return (
                  <Pressable
                    style={[styles.addNewCard, styles.card]}
                    onPress={() => router.push("/(app)/admin/desks")}
                  >
                    <View style={styles.addNewCircle}>
                      <Ionicons name="add" size={22} color={colors.accent.secondary} />
                    </View>
                    <Text variant="body" style={styles.addNewLabel}>Add New Desk</Text>
                  </Pressable>
                );
              }
              return (
                <DeskCard
                  name={item.name}
                  status={item.status}
                  user={"user" in item ? item.user : undefined}
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
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text variant="body" color="muted">
                  {filter === "available" ? "No available desks today." : "No desks for this day."}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
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
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s12,
  },
  filterPills: {
    flexDirection: "row",
    gap: spacing.s4,
    backgroundColor: colors.surface.level2,
    borderRadius: radius.full,
    padding: 3,
  },
  pill: {
    paddingHorizontal: spacing.s12,
    paddingVertical: spacing.s4,
    borderRadius: radius.full,
  },
  pillActive: {
    backgroundColor: colors.surface.level1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pillText: {
    color: colors.text.muted,
  },
  pillTextActive: {
    color: colors.text.primary,
  },
  flatList: {
    flex: 1,
  },
  grid: {
    padding: spacing.s16,
    gap: spacing.s12,
    paddingBottom: spacing.s32,
    flexGrow: 1,
  },
  row: {
    gap: spacing.s12,
  },
  card: {
    flex: 1,
  },
  addNewCard: {
    minHeight: 148,
    borderRadius: radius.r24,
    borderWidth: 2,
    borderColor: colors.border.strong,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s12,
    backgroundColor: "transparent",
  },
  addNewCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.accent.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  addNewLabel: {
    color: colors.accent.secondary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.s40,
  },
});
