// src/lib/stock-history-badge.ts
import type { MovementType, StockHistoryEntry } from "@/types/products.types";

/**
 * 🔹 Tipo "virtual" de evento para exibição.
 * - Usa o tipo do Movement quando existe.
 * - Deriva "DEVOLUCAO" quando o reason do StockHistory indica devolução
 *   (recusa/cancelamento de remessa) — nesse caso não há Movement vinculado.
 */
export type HistoryEventKind = MovementType | "DEVOLUCAO";

export function getHistoryEventKind(
  entry: StockHistoryEntry,
): HistoryEventKind {
  const reason = entry.reason?.trim().toLowerCase() ?? "";
  if (reason.startsWith("devolução") || reason.startsWith("devolucao")) {
    return "DEVOLUCAO";
  }
  return entry.movement?.type ?? "AJUSTE";
  // fallback: se não tem movement nem reason de devolução, mostra "AJUSTE"
  // (é o tipo mais genérico; evita "—" sem badge)
}

export const HISTORY_EVENT_LABEL: Record<HistoryEventKind, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  TRANSFERENCIA: "Transferência",
  DEVOLUCAO: "Devolução",
};

export const HISTORY_EVENT_BADGE: Record<
  HistoryEventKind,
  "default" | "destructive" | "outline" | "secondary"
> = {
  ENTRADA: "default",
  SAIDA: "destructive",
  AJUSTE: "secondary",
  TRANSFERENCIA: "outline",
  DEVOLUCAO: "default",
};
