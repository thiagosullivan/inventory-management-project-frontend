// src/components/products/ProductHistoryTab.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";
import { useProductHistory } from "@/hooks/useProductHistory";
import {
  getHistoryEventKind,
  HISTORY_EVENT_BADGE,
  HISTORY_EVENT_LABEL,
} from "@/lib/stock-history-badge";

interface ProductHistoryTabProps {
  productId: string;
}

export function ProductHistoryTab({ productId }: ProductHistoryTabProps) {
  const { data, isLoading, isError } = useProductHistory(productId);

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

  return (
    <div className="space-y-2">
      {data.history.map((entry) => {
        const kind = getHistoryEventKind(entry);
        const badgeVariant = HISTORY_EVENT_BADGE[kind];
        const badgeLabel = HISTORY_EVENT_LABEL[kind];

        // reason do StockHistory tem prioridade; fallback pro label do tipo
        const reason = entry.reason?.trim() || badgeLabel;

        return (
          <Card key={entry.id}>
            <CardContent className="flex flex-wrap items-center gap-3 py-3">
              <Badge variant={badgeVariant}>{badgeLabel}</Badge>

              <span className="text-sm font-mono">
                {entry.oldQuantity} → {entry.newQuantity}
              </span>

              <span className="text-sm text-muted-foreground max-w-md">
                {reason}
              </span>

              <span className="ml-auto text-xs text-muted-foreground">
                {formatDate(entry.changedAt)} ·{" "}
                {entry.changedBy.name ?? entry.changedBy.email}
              </span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
