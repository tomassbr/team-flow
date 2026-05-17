import React, { useState } from "react";
import {
  View,
  FlatList,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Pressable,
  Modal,
  Text,
  TextInput,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays, isSameDay } from "date-fns";
import { DeskCard } from "@/components/ui/DeskCard";
import { Avatar } from "@/components/ui/Avatar";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { DateStrip } from "@/components/dashboard/DateStrip";
import { MiniCalendar } from "@/components/ui/MiniCalendar";
import { useReservationsQuery } from "@/features/reservations/useReservationsQuery";
import { useCreateReservation } from "@/features/reservations/useCreateReservation";
import { useCreateDesk } from "@/features/desks/useDesksQuery";
import { useDashboardStore, useAuthStore } from "@/store";
import { colors, spacing, radius, gradient, rnShadows } from "@team-flow/shared";

type Filter = "all" | "available";

// Mock data pro offline / preview
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

interface BookingDesk {
  id: string;
  name: string;
}

export default function DashboardScreen() {
  const { selectedDate, setDate } = useDashboardStore();
  const { role } = useAuthStore();
  const isAdmin = role === "ADMIN";
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<Filter>("all");
  const [bookingDesk, setBookingDesk] = useState<BookingDesk | null>(null);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookingPickedDate, setBookingPickedDate] = useState<Date>(selectedDate);
  const [showCalendar, setShowCalendar] = useState(false);
  const [allDay, setAllDay] = useState(true);
  const [startHour, setStartHour] = useState(9);
  const [endHour, setEndHour] = useState(17);
  const [showAddDesk, setShowAddDesk] = useState(false);
  const [newDeskName, setNewDeskName] = useState("");

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const bookingDateStr = format(bookingPickedDate, "yyyy-MM-dd");

  const isTodayPicked = isSameDay(bookingPickedDate, selectedDate);
  const isTomorrowPicked = isSameDay(bookingPickedDate, addDays(selectedDate, 1));
  const isCustomPicked = !isTodayPicked && !isTomorrowPicked;

  const { data, isLoading, isRefetching, refetch, isError } =
    useReservationsQuery(dateStr);

  const createReservation = useCreateReservation();
  const createDesk = useCreateDesk();

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

  type AddNewItem = { id: "__add_new__"; isAddNew: true };
  type DeskItem = (typeof effectiveDesks)[number];
  const gridData: (DeskItem | AddNewItem)[] =
    isAdmin && !usingMock
      ? [...effectiveDesks, { id: "__add_new__", isAddNew: true as const }]
      : effectiveDesks;

  async function handleBook() {
    if (!bookingDesk) return;
    setBookError(null);
    try {
      await createReservation.mutateAsync({ deskId: bookingDesk.id, date: bookingDateStr });
      setBookingDesk(null);
    } catch {
      setBookError("Booking failed. The desk may already be taken.");
    }
  }

  function handleCreateDesk() {
    const name = newDeskName.trim();
    if (!name) return;
    createDesk.mutate(name, {
      onSuccess: () => {
        setNewDeskName("");
        setShowAddDesk(false);
      },
    });
  }

  function dismissSheet() {
    if (createReservation.isPending) return;
    setBookingDesk(null);
    setBookError(null);
    setShowCalendar(false);
    setBookingPickedDate(selectedDate);
    setAllDay(true);
    setStartHour(9);
    setEndHour(17);
    createReservation.reset();
  }

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
            <Text style={styles.inTodayLabel}>IN TODAY</Text>
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
                <Text style={styles.moreCount}>
                  +{effectiveUsers.length - 8}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Offline / mock banner */}
        {usingMock && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              Preview mode — connect to dev server to load real data
            </Text>
          </View>
        )}

        {/* Filter */}
        <View style={styles.filterRow}>
          <Text style={styles.workspaceLabel}>Workspace</Text>
          <View style={styles.filterPills}>
            {(["all", "available"] as Filter[]).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.pill, filter === f && styles.pillActive]}
              >
                <Text
                  style={[
                    styles.pillText,
                    filter === f && styles.pillTextActive,
                  ]}
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
                    onPress={() => setShowAddDesk(true)}
                  >
                    <View style={styles.addNewCircle}>
                      <Ionicons name="add" size={22} color={colors.accent.primary} />
                    </View>
                    <Text style={styles.addNewLabel}>Add New Desk</Text>
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
                    item.status === "available"
                      ? () => { setBookingDesk({ id: item.id, name: item.name }); setBookingPickedDate(selectedDate); }
                      : undefined
                  }
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {filter === "available" ? "No available desks today." : "No desks for this day."}
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Booking Details modal */}
      <Modal
        visible={!!bookingDesk}
        transparent
        animationType="slide"
        onRequestClose={dismissSheet}
      >
        <Pressable style={styles.overlay} onPress={dismissSheet}>
          {/* Outer wrapper — NO overflow:hidden so glow shadow isn't clipped */}
          <Pressable style={styles.bookingSheetOuter} onPress={() => {}}>

            {/* Scroll area — overflow:hidden clips content to rounded corners */}
            <View style={styles.bookingSheetScrollWrap}>
              {/* Header: grabber + title */}
              <View style={styles.sheetHeader}>
                <View style={styles.grabber} />
                <Text style={styles.sheetTitle}>Booking Details</Text>
              </View>

              {/* Scrollable content */}
              <ScrollView
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Workspace Identity */}
                <View style={styles.workspaceCard}>
                  <View style={styles.deskIconCircle}>
                    <Ionicons name="desktop-outline" size={24} color={colors.accent.primary} />
                  </View>
                  <View style={styles.deskInfo}>
                    <Text style={styles.deskName}>{bookingDesk?.name}</Text>
                    <View style={styles.availableRow}>
                      <View style={styles.availableDot} />
                      <Text style={styles.availableText}>Available to book</Text>
                    </View>
                  </View>
                </View>

                {/* Date Selector */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>SELECT DATE</Text>
                  <View style={styles.datePills}>
                    <Pressable
                      style={[styles.datePill, isTodayPicked && styles.datePillActive]}
                      onPress={() => { setBookingPickedDate(selectedDate); setShowCalendar(false); }}
                    >
                      <Text style={[styles.datePillText, isTodayPicked && styles.datePillTextActive]}>
                        Today
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.datePill, isTomorrowPicked && styles.datePillActive]}
                      onPress={() => { setBookingPickedDate(addDays(selectedDate, 1)); setShowCalendar(false); }}
                    >
                      <Text style={[styles.datePillText, isTomorrowPicked && styles.datePillTextActive]}>
                        Tomorrow
                      </Text>
                    </Pressable>
                  </View>
                  {/* Expand/collapse inline calendar */}
                  <Pressable
                    style={[styles.customDateBtn, (isCustomPicked || showCalendar) && styles.customDateBtnActive]}
                    onPress={() => setShowCalendar((v) => !v)}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color={(isCustomPicked || showCalendar) ? colors.accent.primary : colors.text.secondary}
                    />
                    <Text style={[styles.customDateText, (isCustomPicked || showCalendar) && styles.customDateTextActive]}>
                      {isCustomPicked
                        ? format(bookingPickedDate, "EEE, d MMM yyyy")
                        : "Choose Custom Date"}
                    </Text>
                    <Ionicons
                      name={showCalendar ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={(isCustomPicked || showCalendar) ? colors.accent.primary : colors.text.muted}
                    />
                  </Pressable>
                  {/* Inline calendar — only visible when expanded */}
                  {showCalendar && (
                    <View style={styles.calendarCard}>
                      <MiniCalendar
                        selectedDate={bookingPickedDate}
                        minDate={selectedDate}
                        onSelect={(date) => {
                          setBookingPickedDate(date);
                          setShowCalendar(false);
                        }}
                      />
                    </View>
                  )}
                </View>

                {/* Duration / Time */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>DURATION</Text>
                  {/* All Day toggle row */}
                  <View style={styles.allDayRow}>
                    <View style={styles.allDayLeft}>
                      <Ionicons name="sunny-outline" size={18} color={colors.text.secondary} />
                      <Text style={styles.allDayText}>All Day</Text>
                    </View>
                    <Switch
                      value={allDay}
                      onValueChange={setAllDay}
                      trackColor={{ false: colors.border.strong, true: colors.accent.primaryBorder }}
                      thumbColor={allDay ? colors.accent.primary : "#fff"}
                      ios_backgroundColor={colors.border.strong}
                    />
                  </View>
                  {/* Custom time picker — inline hour scroll */}
                  {!allDay && (
                    <View style={styles.customTimeWrap}>
                      <View style={styles.timePickerGroup}>
                        <Text style={styles.timePickerGroupLabel}>FROM</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.hourScroll}
                        >
                          {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => {
                            const active = h === startHour;
                            const disabled = h >= endHour;
                            return (
                              <Pressable
                                key={h}
                                style={[styles.hourBubble, active && styles.hourBubbleActive, disabled && styles.hourBubbleDisabled]}
                                onPress={() => !disabled && setStartHour(h)}
                                disabled={disabled}
                              >
                                <Text style={[styles.hourText, active && styles.hourTextActive, disabled && styles.hourTextDisabled]}>
                                  {`${String(h).padStart(2, "0")}:00`}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                      <View style={styles.timePickerGroup}>
                        <Text style={styles.timePickerGroupLabel}>UNTIL</Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.hourScroll}
                        >
                          {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => {
                            const active = h === endHour;
                            const disabled = h <= startHour;
                            return (
                              <Pressable
                                key={h}
                                style={[styles.hourBubble, active && styles.hourBubbleActive, disabled && styles.hourBubbleDisabled]}
                                onPress={() => !disabled && setEndHour(h)}
                                disabled={disabled}
                              >
                                <Text style={[styles.hourText, active && styles.hourTextActive, disabled && styles.hourTextDisabled]}>
                                  {`${String(h).padStart(2, "0")}:00`}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </ScrollView>
                      </View>
                    </View>
                  )}
                </View>

                {/* Who's Around Today */}
                {effectiveUsers.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>WHO'S AROUND TODAY</Text>
                    <View style={styles.teamCard}>
                      <View style={styles.avatarStack}>
                        {effectiveUsers.slice(0, 2).map((user, idx) => (
                          <View
                            key={user.id}
                            style={[styles.stackedAvatarWrap, { marginLeft: idx > 0 ? -8 : 0, zIndex: 10 - idx }]}
                          >
                            <Avatar name={user.name ?? undefined} src={user.image} size={32} />
                          </View>
                        ))}
                        {effectiveUsers.length > 2 && (
                          <View style={[styles.moreAvatarBadge, { marginLeft: -8 }]}>
                            <Text style={styles.moreAvatarText}>+{Math.min(effectiveUsers.length - 2, 9)}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.teamInfo}>
                        <Text style={styles.teamCount}>{effectiveUsers.length} Teammates</Text>
                        <Text style={styles.teamSubtext}>Working nearby</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Errors */}
                {usingMock && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>Preview mode — start the dev server to book.</Text>
                  </View>
                )}
                {bookError && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{bookError}</Text>
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Sticky bottom — OUTSIDE overflow:hidden so shadow shows correctly */}
            <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + spacing.s16 }]}>
              <View style={styles.glowContainer}>
                <LinearGradient
                  colors={gradient.brand.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.glowBehind}
                />
                <Pressable
                  style={styles.confirmButton}
                  onPress={handleBook}
                  disabled={createReservation.isPending || usingMock}
                >
                  {createReservation.isPending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                      <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Add Desk modal */}
      <Modal
        visible={showAddDesk}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowAddDesk(false); setNewDeskName(""); }}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => { setShowAddDesk(false); setNewDeskName(""); }}
        >
          <Pressable style={styles.addDeskSheet} onPress={() => {}}>
            <View style={styles.grabber} />
            <Text style={styles.sheetTitle}>New Desk</Text>
            <TextInput
              style={styles.addDeskInput}
              placeholder="Desk name (e.g. Window Spot 01)"
              placeholderTextColor={colors.text.muted}
              value={newDeskName}
              onChangeText={setNewDeskName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateDesk}
            />
            <View style={[styles.addDeskActions, { paddingBottom: insets.bottom + spacing.s8 }]}>
              <Pressable
                style={styles.addDeskCancel}
                onPress={() => { setShowAddDesk(false); setNewDeskName(""); }}
              >
                <Text style={styles.addDeskCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addDeskConfirm, !newDeskName.trim() && styles.addDeskConfirmDisabled]}
                onPress={handleCreateDesk}
                disabled={!newDeskName.trim() || createDesk.isPending}
              >
                {createDesk.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.addDeskConfirmText}>Add Desk</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: { flex: 1 },
  container: { flex: 1, backgroundColor: "transparent" },

  whoIsIn: {
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s12,
    gap: spacing.s8,
  },
  inTodayLabel: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: "400",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s8,
  },
  moreCount: {
    fontSize: 14,
    color: colors.text.secondary,
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
  offlineText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.s16,
    paddingBottom: spacing.s12,
  },
  workspaceLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  filterPills: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: radius.full,
    backgroundColor: "rgba(226,232,240,0.3)",
    padding: 5,
  },
  pill: {
    paddingHorizontal: spacing.s12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  pillActive: {
    backgroundColor: colors.surface.level1,
    ...rnShadows.e1,
  },
  pillText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  pillTextActive: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "400",
  },
  flatList: { flex: 1 },
  grid: {
    padding: spacing.s16,
    gap: spacing.s12,
    paddingBottom: spacing.s32,
    flexGrow: 1,
  },
  row: { gap: spacing.s12 },
  card: { flex: 1 },
  addNewCard: {
    minHeight: 180,
    borderRadius: radius.r28,
    borderWidth: 2,
    borderColor: "rgba(199,210,254,0.6)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s12,
    backgroundColor: "rgba(238,242,255,0.2)",
  },
  addNewCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accent.primaryBorder,
    backgroundColor: colors.surface.level1,
    alignItems: "center",
    justifyContent: "center",
    ...rnShadows.e1,
  },
  addNewLabel: {
    fontSize: 14,
    color: colors.accent.primary,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.s40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.muted,
  },

  /* Add Desk Modal */
  addDeskSheet: {
    backgroundColor: colors.surface.level1,
    borderTopLeftRadius: radius.r32,
    borderTopRightRadius: radius.r32,
    paddingTop: spacing.s16,
    paddingHorizontal: spacing.s24,
    gap: spacing.s16,
    alignItems: "center",
    ...rnShadows.e3,
  },
  addDeskInput: {
    width: "100%",
    backgroundColor: colors.surface.level2,
    borderRadius: radius.r12,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingHorizontal: spacing.s16,
    paddingVertical: spacing.s12,
    fontSize: 16,
    color: colors.text.primary,
  },
  addDeskActions: {
    flexDirection: "row",
    gap: spacing.s8,
    width: "100%",
    paddingTop: spacing.s4,
  },
  addDeskCancel: {
    flex: 1,
    height: 48,
    borderRadius: radius.r12,
    borderWidth: 1,
    borderColor: colors.border.strong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface.level1,
  },
  addDeskCancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  addDeskConfirm: {
    flex: 2,
    height: 48,
    borderRadius: radius.r12,
    backgroundColor: colors.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addDeskConfirmDisabled: {
    opacity: 0.4,
  },
  addDeskConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  /* Booking Details Modal */
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.4)",
    justifyContent: "flex-end",
  },
  /* Outer container: rounded top, white bg, NO overflow:hidden → shadow shows */
  bookingSheetOuter: {
    backgroundColor: colors.surface.level1,
    borderTopLeftRadius: radius.r32,
    borderTopRightRadius: radius.r32,
    maxHeight: "92%",
    overflow: "visible",
    ...rnShadows.e3,
  },
  /* Inner scroll area: overflow:hidden clips content to rounded corners */
  bookingSheetScrollWrap: {
    overflow: "hidden",
    borderTopLeftRadius: radius.r32,
    borderTopRightRadius: radius.r32,
  },
  /* Inline calendar card */
  calendarCard: {
    backgroundColor: colors.surface.level1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 20,
    padding: spacing.s12,
    ...rnShadows.e1,
  },
  sheetHeader: {
    alignItems: "center",
    paddingTop: spacing.s16,
    paddingBottom: spacing.s12,
    paddingHorizontal: spacing.s24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    gap: spacing.s12,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: "#a9a8b5",
    opacity: 0.5,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  sheetScroll: {
    flexGrow: 0,
  },
  sheetContent: {
    padding: spacing.s16,
    gap: spacing.s24,
    paddingBottom: spacing.s8,
  },
  /* Workspace Identity */
  workspaceCard: {
    backgroundColor: "rgba(241,245,249,0.8)",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radius.r24,
    padding: 21,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    ...rnShadows.e1,
  },
  deskIconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: "#e0e7ff",
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  deskInfo: {
    flex: 1,
    gap: spacing.s4,
  },
  deskName: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  availableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s8,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: "#34d399",
  },
  availableText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  /* Section */
  section: {
    gap: spacing.s12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.muted,
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  /* Date Selector */
  datePills: {
    flexDirection: "row",
    backgroundColor: "rgba(241,245,249,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    borderRadius: radius.full,
    padding: 5,
  },
  datePill: {
    flex: 1,
    borderRadius: radius.full,
    paddingVertical: 10,
    alignItems: "center",
  },
  datePillActive: {
    backgroundColor: colors.surface.level1,
    ...rnShadows.e1,
  },
  datePillText: {
    fontSize: 14,
    color: colors.text.muted,
  },
  datePillTextActive: {
    fontWeight: "500",
    color: colors.text.primary,
  },
  customDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s8,
    backgroundColor: colors.surface.level1,
    borderWidth: 1,
    borderColor: colors.border.strong,
    borderRadius: radius.full,
    paddingVertical: 13,
  },
  customDateBtnActive: {
    borderColor: colors.accent.primaryBorder,
    backgroundColor: "rgba(238,242,255,0.5)",
  },
  customDateText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  customDateTextActive: {
    color: colors.accent.primary,
  },
  /* Who's Around */
  teamCard: {
    backgroundColor: "rgba(248,250,252,0.8)",
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s16,
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center",
  },
  stackedAvatarWrap: {
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 999,
  },
  moreAvatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: colors.border.strong,
    alignItems: "center",
    justifyContent: "center",
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  teamInfo: {
    flex: 1,
    gap: 2,
  },
  teamCount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  teamSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  /* Error */
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: radius.r12,
    padding: spacing.s12,
  },
  errorText: {
    fontSize: 14,
    color: colors.status.error,
    textAlign: "center",
  },
  /* Sticky bottom */
  stickyBottom: {
    paddingHorizontal: spacing.s24,
    paddingTop: spacing.s16,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(226,232,240,0.6)",
  },
  /*
   * Glow container: relative wrapper, no background.
   * glowBehind: LinearGradient absolutely positioned with -6px inset behind the button.
   * Shadow on the gradient layer approximates the web's filter: blur(14px).
   */
  glowContainer: {
    marginHorizontal: 4,
    marginBottom: 4,
  },
  /*
   * CSS blur() neexistuje v RN — aproximace:
   * gradient stejné velikosti jako button + velký shadowRadius (iOS Gaussian blur shadow)
   * Button navrchu zakrývá gradient, viditelný je pouze "halo" shadow za okraji tlačítka.
   */
  glowBehind: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.r16,
    shadowColor: colors.accent.primary,
    shadowRadius: 20,
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 20,
  },
  confirmButton: {
    backgroundColor: "#0F172A",
    borderRadius: radius.r16,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.s8,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  /* All Day toggle */
  allDayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface.level1,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: 16,
    paddingHorizontal: spacing.s16,
    paddingVertical: 13,
    ...rnShadows.e1,
  },
  allDayLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.s8,
  },
  allDayText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
  },
  /* Custom time picker */
  customTimeWrap: {
    gap: spacing.s12,
  },
  timePickerGroup: {
    gap: spacing.s8,
  },
  timePickerGroupLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.muted,
    letterSpacing: 0.8,
    paddingLeft: spacing.s4,
  },
  hourScroll: {
    gap: spacing.s8,
    paddingHorizontal: spacing.s4,
  },
  hourBubble: {
    paddingHorizontal: spacing.s12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.strong,
    backgroundColor: colors.surface.level1,
  },
  hourBubbleActive: {
    backgroundColor: colors.accent.primary,
    borderColor: colors.accent.primary,
  },
  hourBubbleDisabled: {
    backgroundColor: "transparent",
    borderColor: colors.border.subtle,
    opacity: 0.4,
  },
  hourText: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.text.primary,
  },
  hourTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  hourTextDisabled: {
    color: colors.text.muted,
  },
});
