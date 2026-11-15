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

          // "Última ação" = a data mais recente entre finalizedAt / refusedAt / updatedAt
          const candidates = [r.finalizedAt, r.refusedAt, r.updatedAt]
            .filter((d): d is string => !!d)
            .map((d) => new Date(d).getTime());
          const lastActionAt =
            candidates.length > 0
              ? new Date(Math.max(...candidates)).toISOString()
              : r.createdAt;

          return (
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
          );
        })}
      </tbody>
      {includeItems && (
        <tfoot>
          <tr>
            <td colSpan={6} className="print-event-sub print-italic">
              Incluir itens por pedido não está implementado nesta versão.
              Marque "Detalhe do pedido" no dialog ou imprima o pedido
              individual.
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
