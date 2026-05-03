import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { api } from "../../lib/apiClient";
import { ApiError } from "@team-flow/api-client";

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { deskId: string; date: string }) =>
      api.reservations.create(params),

    onSuccess: (_, variables) => {
      // Haptic feedback — makes the booking feel physical and real
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Invalidate the cache for this date so the desk grid refreshes
      queryClient.invalidateQueries({
        queryKey: ["reservations", variables.date],
      });
    },

    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (error instanceof ApiError && error.isConflict) {
        // Desk already booked or user already has a reservation today
        // The UI should show this message to the user
        console.warn("Booking conflict:", error.message);
      }
    },
  });
}
