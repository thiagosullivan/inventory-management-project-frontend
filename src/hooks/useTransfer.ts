// src/hooks/useTransfer.ts
import { useQuery } from "@tanstack/react-query";
import { fetchTransferById } from "@/services/transfers";

export function useTransfer(id: string | null | undefined) {
  return useQuery({
    queryKey: ["transfers", "detail", id],
    queryFn: () => fetchTransferById(id as string),
    enabled: !!id,
  });
}
