// src/components/products/ProductHistoryTab.tsx
import { useMemo, useState } from "react";
import { Eye } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { useProductHistory } from "@/hooks/useProductHistory";
import {
  getHistoryEventKind,
  HISTORY_EVENT_BADGE,
  HISTORY_EVENT_LABEL,
} from "@/lib/stock-history-badge";
import { ProductHistoryChart } from "./ProductHistoryChart";
import { TransferDetailsDialog } from "@/components/movements/TransferDetailsDialog";
import { MovementDetailsDialog } from "@/components/history/MovementDetailsDialog";
import { stockHistoryToMovementRef } from "@/lib/stock-history-adapter";
import { useProduct } from "@/hooks/useProduct";
import type { StockHistoryEntry } from "@/types/products.types";
import type { HistoryMovementRef } from "@/types/history.types";

interface ProductHistoryTabProps {
  productId: string;
}

// =============================
// Agrupamento por dia
// =============================

interface DayGroup {
  key: string; // YYYY-MM-DD
  label: string; // "12/11/2026"
  entries: StockHistoryEntry[];
}

function groupByDay(history: StockHistoryEntry[]): DayGroup[] {
  const map = new Map<string, StockHistoryEntry[]>();

  for (const h of history) {
    const d = new Date(h.changedAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    const arr = map.get(key) ?? [];
    arr.push(h);
    map.set(key, arr);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // desc
    .map(([key, entries]) => ({
      key,
      label: new Date(`${key}T00:00:00.000Z`).toLocaleDateString("pt-BR"),
      entries,
    }));
}

// =============================
// Componente
// =============================

export function ProductHistoryTab({ productId }: ProductHistoryTabProps) {
  const { data, isLoading, isError } = useProductHistory(productId);
  const { data: product } = useProduct(productId);

  // Estado dos dialogs
  const [transferDetailId, setTransferDetailId] = useState<string | null>(null);
  const [movementDetail, setMovementDetail] =
    useState<HistoryMovementRef | null>(null);

  const groups = useMemo(() => (data ? groupByDay(data.history) : []), [data]);

  // Produto para o adapter
  const productRef = useMemo(
    () =>
      product
        ? {
            id: product.id,
            name: product.name,
            sku: product.sku,
            imageUrl: product.imageUrl,
          }
        : null,
    [product],
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-6">Carregando...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive py-6">
        Erro ao carregar histórico.
      </p>
    );
  }

  if (data.history.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Nenhum registro no histórico.
        </CardContent>
      </Card>
    );
  }

  function handleOpenDetails(entry: StockHistoryEntry) {
    if (!productRef) return;
    // Se tem movement.transferId → abre o dialog de remessa
    if (entry.movement?.transferId) {
      setTransferDetailId(entry.movement.transferId);
      return;
    }
    // Senão, abre o dialog de movimentação (se tiver movement)
    const ref = stockHistoryToMovementRef(entry, productRef);
    if (ref) {
      setMovementDetail(ref);
    }
  }

  return (
    <div className="space-y-4">
      {/* Gráfico */}
      <ProductHistoryChart history={data.history} />

      {/* Lista agrupada por dia */}
      {groups.map((group) => (
        <div key={group.key} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sticky top-0 bg-background py-1">
            {group.label}
          </h4>
          {group.entries.map((entry) => {
            const kind = getHistoryEventKind(entry);
            const badgeVariant = HISTORY_EVENT_BADGE[kind];
            const badgeLabel = HISTORY_EVENT_LABEL[kind];
            const delta = entry.newQuantity - entry.oldQuantity;
            const reason = entry.reason?.trim() || badgeLabel;
            const canOpen =
              !!entry.movement && (!!entry.movement.transferId || !!productRef);

            return (
              <Card key={entry.id}>
                <CardContent className="flex flex-wrap items-center gap-3 py-3">
                  <Badge variant={badgeVariant}>{badgeLabel}</Badge>

                  <span className="text-sm font-mono">
                    {entry.oldQuantity} → {entry.newQuantity}
                  </span>

                  <span
                    className={`text-xs font-mono ${
                      delta > 0
                        ? "text-emerald-700"
                        : delta < 0
                          ? "text-red-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    ({delta > 0 ? `+${delta}` : delta})
                  </span>

                  <span className="text-sm text-muted-foreground max-w-md">
                    {reason}
                  </span>

                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatDate(entry.changedAt)} ·{" "}
                    {entry.changedBy.name ?? entry.changedBy.email}
                  </span>

                  {canOpen && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDetails(entry)}
                      title="Ver detalhes"
                      className="cursor-pointer hover:text-primary"
                    >
                      <Eye size={16} />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}

      {/* Dialogs */}
      <TransferDetailsDialog
        transferId={transferDetailId}
        open={transferDetailId !== null}
        onOpenChange={(open) => {
          if (!open) setTransferDetailId(null);
        }}
      />

      <MovementDetailsDialog
        movement={movementDetail}
        open={movementDetail !== null}
        onOpenChange={(open) => {
          if (!open) setMovementDetail(null);
        }}
      />
    </div>
  );
}
