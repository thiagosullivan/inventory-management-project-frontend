import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format-date";
import { useProductMovements } from "@/hooks/useProductMovements";
import type { MovementType } from "@/types/products.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ProductMovementsTabProps {
  productId: string;
  onNewMovement: () => void;
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

export function ProductMovementsTab({
  productId,
  onNewMovement,
}: ProductMovementsTabProps) {
  const { data, isLoading, isError } = useProductMovements(productId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-6">Carregando...</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive py-6">
        Erro ao carregar movimentações.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={onNewMovement}>
          <Plus className="h-4 w-4 mr-1" />
          Nova movimentação
        </Button>
      </div>

      {data.movements.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma movimentação registrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {data.movements.map((movement) => (
            <Card key={movement.id}>
              <CardContent className="flex flex-wrap items-center gap-3 py-3">
                <Badge variant={TYPE_BADGE[movement.type]}>
                  {TYPE_LABEL[movement.type]}
                </Badge>
                <span className="font-mono text-sm">
                  {movement.quantity > 0
                    ? `+${movement.quantity}`
                    : movement.quantity}
                </span>
                <span className="text-sm text-muted-foreground">
                  {movement.reason || "—"}
                </span>
                {movement.unitPriceInCents != null && (
                  <span className="text-xs text-muted-foreground">
                    {formatCentsToBRL(movement.unitPriceInCents)} un.
                  </span>
                )}
                {movement.supplier && (
                  <span className="text-xs text-muted-foreground">
                    · {movement.supplier}
                  </span>
                )}
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatDate(movement.createdAt)} ·{" "}
                  {movement.createdBy.name ?? movement.createdBy.email}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
