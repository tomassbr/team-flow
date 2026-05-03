import React, { useCallback, useRef } from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import { useCreateReservation } from "@/features/reservations/useCreateReservation";
import { ApiError } from "@team-flow/api-client";
import { colors, spacing, radius } from "@team-flow/shared";

export default function BookDeskScreen() {
  const { deskId, deskName, date } = useLocalSearchParams<{
    deskId: string;
    deskName: string;
    date: string;
  }>();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const { mutate: createReservation, isPending, error } = useCreateReservation();

  const handleBook = useCallback(() => {
    createReservation(
      { deskId, date },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  }, [createReservation, deskId, date]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  const conflictError =
    error instanceof ApiError && error.isConflict
      ? "This desk is already booked, or you already have a reservation today."
      : error
        ? "Booking failed. Please try again."
        : null;

  return (
    <SafeAreaView style={styles.backdrop}>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["45%"]}
        enablePanDownToClose
        onClose={handleClose}
        backgroundStyle={styles.sheet}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.content}>
          <View style={styles.header}>
            <Text variant="h1">{deskName}</Text>
            <StatusChip status="available" />
          </View>

          <View style={styles.dateRow}>
            <Text variant="body" color="secondary">
              Date
            </Text>
            <Text variant="bodyStrong">{date}</Text>
          </View>

          {conflictError && (
            <Text variant="caption" style={{ color: colors.status.error }}>
              {conflictError}
            </Text>
          )}

          <View style={styles.actions}>
            <Button
              variant="secondary"
              label="Cancel"
              onPress={handleClose}
              style={styles.cancelBtn}
            />
            <Button
              variant="gradient"
              label="Book desk"
              loading={isPending}
              onPress={handleBook}
              style={styles.bookBtn}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  sheet: {
    backgroundColor: colors.surface.level1,
    borderRadius: radius.r24,
  },
  handle: {
    backgroundColor: colors.border.strong,
  },
  content: {
    padding: spacing.s24,
    gap: spacing.s16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface.level2,
    padding: spacing.s16,
    borderRadius: radius.r12,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.s12,
    marginTop: spacing.s8,
  },
  cancelBtn: {
    flex: 1,
  },
  bookBtn: {
    flex: 2,
  },
});
