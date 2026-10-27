import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format-date";
import { useProductHistory } from "@/hooks/useProductHistory";
import type { MovementType } from "@/types/products.types";

interface ProductHistoryTabProps {
  productId: string;
}

const TYPE_LABEL: Record<MovementType, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  TRANSFERENCIA: "Transferência",
};

const TYPE_BADGE: Record<
  MovementType,
  "default" | "destructive" | "outline" | "secondary"
> = {
  ENTRADA: "default",
  SAIDA: "destructive",
  AJUSTE: "secondary",
  TRANSFERENCIA: "outline",
};

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
        // 🔹 reason do StockHistory tem prioridade; fallback pro tipo do Movement
        const reason =
          entry.reason?.trim() ||
          (entry.movement ? TYPE_LABEL[entry.movement.type] : "—");

        return (
          <Card key={entry.id}>
            <CardContent className="flex flex-wrap items-center gap-3 py-3">
              {entry.movement && (
                <Badge variant={TYPE_BADGE[entry.movement.type]}>
                  {TYPE_LABEL[entry.movement.type]}
                </Badge>
              )}

              <span className="text-sm font-mono">
                {entry.oldQuantity} → {entry.newQuantity}
              </span>

              <span className="text-sm text-muted-foreground truncate max-w-md">
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
