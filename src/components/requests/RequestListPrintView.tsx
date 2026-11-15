// src/components/requests/RequestListPrintView.tsx
import type {
  PurchaseRequestResponse,
  PurchaseRequestStatus,
} from "@/types/purchaseRequests.types";
import { shortenId } from "@/lib/shorten-id";
import { formatPrintDateTime } from "@/lib/print/print-utils";

const STATUS_LABEL: Record<PurchaseRequestStatus, string> = {
  TODOS: "Todos",
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

interface RequestListPrintViewProps {
  requests: PurchaseRequestResponse[];
  includeItems: boolean;
}

export function RequestListPrintView({
  requests,
  includeItems,
}: RequestListPrintViewProps) {
  return (
    <table className="print-table">
      <colgroup>
        <col style={{ width: "12%" }} />
        <col style={{ width: "18%" }} />
        <col style={{ width: "16%" }} />
        <col style={{ width: "10%" }} />
        <col style={{ width: "22%" }} />
        <col style={{ width: "22%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>ID</th>
          <th>Setor</th>
          <th>Status</th>
          <th style={{ textAlign: "right" }}>Itens</th>
          <th>Criado em</th>
          <th>Última ação</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => {
          const itemsCount = r._count?.items ?? r.items?.length ?? 0;
          const transfersCount =
            r._count?.transfers ?? r.transfers?.length ?? 0;

          const candidates = [r.finalizedAt, r.refusedAt, r.updatedAt]
            .filter((d): d is string => !!d)
            .map((d) => new Date(d).getTime());
          const lastActionAt =
            candidates.length > 0
              ? new Date(Math.max(...candidates)).toISOString()
              : r.createdAt;

          const items = r.items ?? [];

          return (
            <>
              <tr key={r.id}>
                <td className="print-mono">{shortenId(r.id)}</td>
                <td>{r.sector?.name ?? "—"}</td>
                <td>{STATUS_LABEL[r.status]}</td>
                <td className="print-col-qty">{itemsCount}</td>
                <td className="print-col-date">
                  {formatPrintDateTime(r.createdAt)}
                </td>
                <td className="print-col-date">
                  {formatPrintDateTime(lastActionAt)}
                  {transfersCount > 0 && (
                    <div className="print-event-sub">
                      {transfersCount} remessa
                      {transfersCount === 1 ? "" : "s"}
                    </div>
                  )}
                </td>
              </tr>

              {/* 🔹 Detalhamento de itens (se checkbox marcado) */}
              {includeItems && (
                <tr className="print-request-subrow">
                  <td></td>
                  <td colSpan={5}>
                    <div className="print-request-items">
                      <p className="print-request-items__title">
                        Itens do pedido ({items.length})
                      </p>
                      {items.length === 0 ? (
                        <p className="print-event-sub print-italic">
                          Sem itens detalhados.
                        </p>
                      ) : (
                        <table className="print-table print-table--nested">
                          <colgroup>
                            <col style={{ width: "55%" }} />
                            <col style={{ width: "20%" }} />
                            <col style={{ width: "15%" }} />
                            <col style={{ width: "10%" }} />
                          </colgroup>
                          <thead>
                            <tr>
                              <th>Produto</th>
                              <th>SKU</th>
                              <th>Barcode</th>
                              <th style={{ textAlign: "right" }}>Qtd</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((it) => (
                              <tr key={it.id}>
                                <td>{it.product.name}</td>
                                <td className="print-mono">{it.product.sku}</td>
                                <td className="print-mono">
                                  {it.product.barcode}
                                </td>
                                <td className="print-col-qty">{it.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })}
      </tbody>
    </table>
  );
}
