import type { Product } from "@/types/products.types";

export type ProductStockStatus = {
  label: string;
  variant: "destructive" | "warning" | "outline";
  /** Código estável pro front (útil pra filtros/condicionais depois) */
  code: "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";
};

/**
 * Calcula o status do estoque de um produto.
 * Regras:
 * - quantity === 0 → OUT_OF_STOCK (vermelho)
 * - quantity <= minStock (e minStock definido) → LOW_STOCK (amarelo)
 * - senão → IN_STOCK (padrão)
 *
 * Se minStock não estiver definido, considera IN_STOCK
 * (mesma regra do backend, no checkStockAlerts).
 */
export function getStockStatus(product: Product): ProductStockStatus {
  if (product.quantity === 0) {
    return {
      label: "Sem estoque",
      variant: "destructive",
      code: "OUT_OF_STOCK",
    };
  }

  if (product.minStock !== null && product.quantity <= product.minStock) {
    return {
      label: "Estoque baixo",
      variant: "warning",
      code: "LOW_STOCK",
    };
  }

  return {
    label: "Em estoque",
    variant: "outline",
    code: "IN_STOCK",
  };
}
