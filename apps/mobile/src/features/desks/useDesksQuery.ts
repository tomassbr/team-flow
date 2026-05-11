import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

export function useDesksQuery() {
  return useQuery({
    queryKey: ["desks"],
    queryFn: () => api.desks.list(),
    staleTime: 30_000,
  });
}

export function useCreateDesk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.desks.create(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["desks"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useDeleteDesk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.desks.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["desks"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useUpdateDesk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: { name?: string; isActive?: boolean } }) =>
      api.desks.update(id, fields),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["desks"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
