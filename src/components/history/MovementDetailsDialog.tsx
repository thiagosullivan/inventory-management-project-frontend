// src/components/history/MovementDetailsDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { HistoryMovementRef } from "@/types/history.types";
import { useNavigate } from "react-router-dom";

const TYPE_LABEL: Record<HistoryMovementRef["type"], string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  TRANSFERENCIA: "Transferência",
};

const STATUS_LABEL: Record<HistoryMovementRef["status"], string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCents(value: number | null): string {
  if (value === null) return "—";
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

interface MovementDetailsDialogProps {
  movement: HistoryMovementRef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovementDetailsDialog({
  movement,
  open,
  onOpenChange,
}: MovementDetailsDialogProps) {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Detalhe da movimentação
          </DialogTitle>
          <DialogDescription>
            {movement ? movement.product.name : ""}
          </DialogDescription>
        </DialogHeader>

        {movement && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-mono">{movement.product.sku}</span>

              <span className="text-muted-foreground">Tipo</span>
              <span>{TYPE_LABEL[movement.type]}</span>

              <span className="text-muted-foreground">Status</span>
              <span>{STATUS_LABEL[movement.status]}</span>

              <span className="text-muted-foreground">Quantidade</span>
              <span
                className={
                  movement.quantity < 0 ? "text-red-600" : "text-emerald-700"
                }
              >
                {movement.quantity}
              </span>

              <span className="text-muted-foreground">Valor unitário</span>
              <span>{formatCents(movement.unitPriceInCents)}</span>

              <span className="text-muted-foreground">Data</span>
              <span>{formatDateTime(movement.createdAt)}</span>

              <span className="text-muted-foreground">Autor</span>
              <span>{movement.createdBy.name ?? "—"}</span>

              <span className="text-muted-foreground">Origem</span>
              <span>{movement.fromSector?.name ?? "—"}</span>

              <span className="text-muted-foreground">Destino</span>
              <span>{movement.toSector?.name ?? "—"}</span>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">Motivo</p>
              <p className="rounded border bg-muted/30 px-3 py-2 text-sm">
                {movement.reason ?? "—"}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={() => navigate(`/products/${movement?.product.id}`)}
            className="cursor-pointer"
          >
            Ver Produto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
