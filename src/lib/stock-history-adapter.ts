// src/lib/stock-history-adapter.ts
import type { StockHistoryEntry } from "@/types/products.types";
import type {
  HistoryMovementRef,
  HistoryProductRef,
  HistorySectorRef,
  HistoryUserRef,
} from "@/types/history.types";

/**
 * 🔹 Converte um StockHistoryEntry (com movement expandido) em
 *    HistoryMovementRef — shape que o MovementDetailsDialog espera.
 *    Retorna null se o entry não tem movement (ex.: criação do produto).
 */
export function stockHistoryToMovementRef(
  entry: StockHistoryEntry,
  productRef: HistoryProductRef,
): HistoryMovementRef | null {
  if (!entry.movement) return null;

  const createdBy: HistoryUserRef = {
    id: entry.changedBy.id,
    name: entry.changedBy.name,
  };

  const fromSector: HistorySectorRef | null = entry.movement.fromSector
    ? {
        id: entry.movement.fromSector.id,
        name: entry.movement.fromSector.name,
        isWarehouse: entry.movement.fromSector.isWarehouse,
      }
    : null;

  const toSector: HistorySectorRef | null = entry.movement.toSector
    ? {
        id: entry.movement.toSector.id,
        name: entry.movement.toSector.name,
        isWarehouse: entry.movement.toSector.isWarehouse,
      }
    : null;

  return {
    id: entry.movement.id,
    type: entry.movement.type,
    status: entry.movement.status,
    quantity: entry.movement.quantity,
    reason: entry.movement.reason,
    unitPriceInCents: entry.movement.unitPriceInCents,
    createdAt: entry.movement.createdAt,
    product: productRef,
    createdBy,
    fromSector,
    toSector,
  };
}
