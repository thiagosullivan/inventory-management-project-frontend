// src/components/requests/RequestTransfersList.tsx
import { ImageOff } from "lucide-react";

import { formatDateTime } from "@/lib/format-date";
import type {
  PurchaseRequestTransferDetailRef,
  TransferStatusRef,
} from "@/types/purchaseRequests.types";

const STATUS_LABEL: Record<TransferStatusRef, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

const STATUS_CLASS: Record<TransferStatusRef, string> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  CONCLUIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

export interface RequestTransfersListProps {
  transfers: PurchaseRequestTransferDetailRef[];
}

export function RequestTransfersList({ transfers }: RequestTransfersListProps) {
  if (transfers.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-muted-foreground">
        Nenhuma remessa vinculada ainda.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {transfers.map((t) => (
        <li key={t.id} className="rounded border">
          {/* Cabeçalho da remessa */}
          <div className="bg-muted/50 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-x-2 text-end">
              <span
                className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[t.status]}`}
              >
                {STATUS_LABEL[t.status]}
              </span>
              <span className="font-mono text-xs uppercase text-muted-foreground font-bold">
                #{t.id.slice(0, 8)}
              </span>
            </div>
            <div className="text-end">
              <div className="flex items-center gap-x-2">
                <p className="text-xs font-bold text-primary">
                  Criada:{" "}
                  <span className="font-medium text-muted-foreground">
                    {formatDateTime(t.createdAt)}
                  </span>
                </p>
                {t.createdBy && (
                  <div className="text-xs text-muted-foreground">
                    por{" "}
                    <strong className="text-primary">
                      {t.createdBy.name ?? t.createdBy.email}
                    </strong>
                  </div>
                )}
              </div>
              {t.confirmedAt && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">Confirmada</span> em{" "}
                  {formatDateTime(t.confirmedAt)}
                </p>
              )}
              {t.refusedAt && (
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">Recusada</span> em{" "}
                  {formatDateTime(t.refusedAt)}
                </p>
              )}
              {t.cancelledAt && (
                <span className="text-xs text-muted-foreground">
                  · Cancelada em {formatDateTime(t.cancelledAt)}
                </span>
              )}
            </div>
          </div>

          {/* Motivos */}
          {t.reason && (
            <p className="px-3 pt-2 text-xs text-muted-foreground">
              Motivo: “{t.reason}”
            </p>
          )}
          {t.cancelReason && (
            <p className="px-3 pt-2 text-xs text-red-700">
              Cancelamento: “{t.cancelReason}”
            </p>
          )}

          {/* Itens */}
          {t.items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              Sem itens.
            </p>
          ) : (
            <table className="w-full text-sm mt-2">
              <thead className="text-left border-b">
                <tr>
                  <th className="px-3 py-2 font-semibold"></th>
                  <th className="px-3 py-2 font-semibold">Produto</th>
                  <th className="px-3 py-2 font-semibold">SKU</th>
                  <th className="px-3 py-2 font-semibold">Barcode</th>
                  <th className="px-3 py-2 font-semibold text-right">Qtd</th>
                </tr>
              </thead>
              <tbody>
                {t.items.map((it) => (
                  <tr key={it.id} className="border-t">
                    <td className="px-3 py-2">
                      {it.product.imageUrl ? (
                        <img
                          src={it.product.imageUrl}
                          className="w-15 h-15"
                          alt={it.product.name}
                        />
                      ) : (
                        <div className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded-md">
                          <ImageOff />
                        </div>
                      )}
                    </td>
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
        </li>
      ))}
    </ul>
  );
}
