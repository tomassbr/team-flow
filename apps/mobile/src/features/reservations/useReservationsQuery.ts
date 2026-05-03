import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/apiClient";

export function useReservationsQuery(date: string) {
  return useQuery({
    queryKey: ["reservations", date],
    queryFn: () => api.reservations.list(date),
    staleTime: 30_000,
  });
}
