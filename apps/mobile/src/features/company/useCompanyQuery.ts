import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/apiClient";

export function useCompanyQuery() {
  return useQuery({
    queryKey: ["company"],
    queryFn: () => api.company.get(),
    // Company data changes rarely — cache for 10 minutes
    staleTime: 10 * 60 * 1000,
  });
}
