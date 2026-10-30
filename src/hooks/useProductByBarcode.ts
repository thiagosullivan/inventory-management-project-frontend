// src/hooks/useProductByBarcode.ts
import { useQuery } from "@tanstack/react-query";
import { fetchProductByBarcode } from "@/services/products";
import { getApiErrorCode } from "@/lib/api-error";
import type { Product } from "@/types/products.types";

/**
 * Busca produto por barcode via endpoint dedicado.
 * - `404` (PRODUCT_NOT_FOUND) → resolve `null` (não é erro de UI).
 * - Outros erros → propaga.
 * Retorna `null` quando não encontra.
 */
export function useProductByBarcode(
  barcode: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const trimmed = barcode?.trim() ?? "";
  const enabled = (options?.enabled ?? true) && trimmed.length > 0;

  return useQuery({
    queryKey: ["products", "byBarcode", trimmed],
    enabled,
    staleTime: 0,
    gcTime: 30_000,
    retry: false,
    queryFn: async (): Promise<Product | null> => {
      try {
        return await fetchProductByBarcode(trimmed);
      } catch (err) {
        const code = getApiErrorCode(err);
        const status = (err as { response?: { status?: number } })?.response
          ?.status;
        if (code === "PRODUCT_NOT_FOUND" || status === 404) return null;
        throw err;
      }
    },
  });
}
