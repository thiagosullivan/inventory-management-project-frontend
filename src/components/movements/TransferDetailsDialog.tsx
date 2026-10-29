// src/components/movements/TransferDetailsDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useTransfer } from "@/hooks/useTransfer";
import { formatDateTime } from "@/lib/format-date";
import type { TransferStatus } from "@/types/transfers.types";

const STATUS_LABEL: Record<TransferStatus, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

const STATUS_CLASS: Record<TransferStatus, string> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  CONCLUIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
};

interface TransferDetailsDialogProps {
  transferId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferDetailsDialog({
  transferId,
  open,
  onOpenChange,
}: TransferDetailsDialogProps) {
  const query = useTransfer(transferId);
  const transfer = query.data;
  const items = transfer?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-primary">
            Detalhes da remessa
          </DialogTitle>
          <DialogDescription>
            {transferId ? (
              <>
                ID <span className="font-mono">{transferId.slice(0, 8)}</span>
                {transfer?.purchaseRequestId && (
                  <>
                    {" "}
                    · pedido{" "}
                    <span className="font-mono">
                      {transfer.purchaseRequestId.slice(0, 8)}
                    </span>
                  </>
                )}
              </>
            ) : (
              "Nenhuma remessa selecionada."
            )}
          </DialogDescription>
        </DialogHeader>

        {query.isLoading && (
          <p className="text-sm text-muted-foreground">Carregando remessa...</p>
        )}

        {query.isError && !query.isLoading && (
          <p className="text-sm text-destructive">
            Não foi possível carregar a remessa.
          </p>
        )}

        {transfer && (
          <div className="space-y-4">
            {/* Status + setores */}
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[transfer.status]}`}
              >
                {STATUS_LABEL[transfer.status]}
              </span>
              <span className="text-sm">
                <strong>{transfer.fromSector?.name ?? "—"}</strong>
                {" → "}
                <strong>{transfer.toSector?.name ?? "—"}</strong>
              </span>
            </div>

            {/* Metadados */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Criada por</dt>
                <dd>{transfer.createdBy?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Criada em</dt>
                <dd>{formatDateTime(transfer.createdAt)}</dd>
              </div>

              {transfer.confirmedBy && (
                <>
                  <div>
                    <dt className="text-muted-foreground">Confirmada por</dt>
                    <dd>{transfer.confirmedBy.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Confirmada em</dt>
                    <dd>{formatDateTime(transfer.confirmedAt)}</dd>
                  </div>
                </>
              )}

              {transfer.refusedBy && (
                <>
                  <div>
                    <dt className="text-muted-foreground">Recusada por</dt>
                    <dd>{transfer.refusedBy.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Recusada em</dt>
                    <dd>{formatDateTime(transfer.refusedAt)}</dd>
                  </div>
                </>
              )}

              {transfer.cancelledBy && (
                <>
                  <div>
                    <dt className="text-muted-foreground">Cancelada por</dt>
                    <dd>{transfer.cancelledBy.name ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Cancelada em</dt>
                    <dd>{formatDateTime(transfer.cancelledAt)}</dd>
                  </div>
                </>
              )}

              {transfer.reason && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Motivo</dt>
                  <dd className="whitespace-pre-wrap">{transfer.reason}</dd>
                </div>
              )}

              {transfer.cancelReason && (
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">
                    Motivo do cancelamento
                  </dt>
                  <dd className="whitespace-pre-wrap">
                    {transfer.cancelReason}
                  </dd>
                </div>
              )}
            </dl>

            {/* Itens */}
            <div className="rounded border">
              <div className="bg-muted/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                Itens ({items.length})
              </div>
              {items.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  Sem itens carregados.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-left border-b">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Produto</th>
                      <th className="px-3 py-2 font-semibold">SKU</th>
                      <th className="px-3 py-2 font-semibold">Barcode</th>
                      <th className="px-3 py-2 font-semibold text-right">
                        Qtd
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id} className="border-t">
                        <td className="px-3 py-2">{it.product.name}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {it.product.sku}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {it.product.barcode}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">
                          {it.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
