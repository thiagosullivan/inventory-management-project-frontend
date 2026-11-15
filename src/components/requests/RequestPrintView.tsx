// src/components/requests/RequestPrintView.tsx
import type {
  PurchaseRequestDetailResponse,
  PurchaseRequestStatus,
  TransferStatusRef,
} from "@/types/purchaseRequests.types";
import { shortenId } from "@/lib/shorten-id";
import { formatPrintDateTime } from "@/lib/print/print-utils";
// 🔹 REMOVIDO: import { formatPrintCents } from "@/lib/print/print-utils";

const STATUS_LABEL: Record<PurchaseRequestStatus, string> = {
  TODOS: "Todos",
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const TRANSFER_STATUS_LABEL: Record<TransferStatusRef, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="print-field">
      <div className="print-field__label">{label}</div>
      <div className="print-field__value">{value || "—"}</div>
    </div>
  );
}

interface RequestPrintViewProps {
  request: PurchaseRequestDetailResponse;
  includeTransfers: boolean;
}

export function RequestPrintView({
  request,
  includeTransfers,
}: RequestPrintViewProps) {
  const items = request.items ?? [];
  const transfers = request.transfers ?? [];

  const totalRequestedQty = items.reduce((acc, it) => acc + it.quantity, 0);
  const totalSentQty = transfers
    .filter((t) => t.status === "CONCLUIDO")
    .reduce((acc, t) => acc + t.items.reduce((s, it) => s + it.quantity, 0), 0);

  return (
    <div className="print-product">
      {/* ---- Cabeçalho do pedido ---- */}
      <section className="print-section">
        <h2 className="print-section__title">
          Pedido #{shortenId(request.id)}
        </h2>

        <div className="print-grid-2">
          <Field
            label="Setor solicitante"
            value={request.sector?.name ?? "—"}
          />
          <Field label="Status" value={STATUS_LABEL[request.status]} />
          <Field
            label="Criado em"
            value={formatPrintDateTime(request.createdAt)}
          />
          <Field
            label="Criado por"
            value={request.createdBy?.name ?? request.createdBy?.email ?? "—"}
          />
          {request.finalizedBy && (
            <>
              <Field
                label="Finalizado em"
                value={formatPrintDateTime(request.finalizedAt)}
              />
              <Field
                label="Finalizado por"
                value={
                  request.finalizedBy.name ?? request.finalizedBy.email ?? "—"
                }
              />
            </>
          )}
          {request.refusedBy && (
            <>
              <Field
                label="Recusado em"
                value={formatPrintDateTime(request.refusedAt)}
              />
              <Field
                label="Recusado por"
                value={request.refusedBy.name ?? request.refusedBy.email ?? "—"}
              />
            </>
          )}
        </div>

        {request.notes && (
          <Field
            label="Observações do pedido"
            value={<span className="whitespace-pre-wrap">{request.notes}</span>}
          />
        )}
        {request.refusalReason && (
          <Field
            label="Motivo da recusa"
            value={
              <span className="whitespace-pre-wrap">
                {request.refusalReason}
              </span>
            }
          />
        )}
        {request.finalizeNote && (
          <Field
            label="Nota de finalização"
            value={
              <span className="whitespace-pre-wrap">
                {request.finalizeNote}
              </span>
            }
          />
        )}
      </section>

      {/* ---- Itens ---- */}
      <section className="print-section">
        <h2 className="print-section__title">
          Itens ({items.length} · {totalRequestedQty} un.)
        </h2>

        {items.length === 0 ? (
          <p className="print-empty">Sem itens registrados.</p>
        ) : (
          <table className="print-table">
            <colgroup>
              <col style={{ width: "50%" }} />
              <col style={{ width: "15%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "15%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Produto</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th style={{ textAlign: "right" }}>Qtd pedida</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>{it.product.name}</td>
                  <td className="print-mono">{it.product.sku}</td>
                  <td className="print-mono">{it.product.barcode}</td>
                  <td className="print-col-qty">{it.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ---- Remessas ---- */}
      {includeTransfers && (
        <section className="print-section">
          <h2 className="print-section__title">
            Remessas ({transfers.length} · {totalSentQty} un. enviadas)
          </h2>

          {transfers.length === 0 ? (
            <p className="print-empty">Nenhuma remessa vinculada.</p>
          ) : (
            transfers.map((t) => (
              <div key={t.id} style={{ marginBottom: "3mm" }}>
                <div className="print-event-title">
                  Remessa #{shortenId(t.id)} · {TRANSFER_STATUS_LABEL[t.status]}{" "}
                  · {formatPrintDateTime(t.createdAt)}
                </div>
                {t.confirmedAt && (
                  <div className="print-event-sub">
                    Confirmada em {formatPrintDateTime(t.confirmedAt)}
                  </div>
                )}
                {t.refusedAt && (
                  <div className="print-event-sub">
                    Recusada em {formatPrintDateTime(t.refusedAt)}
                    {t.refusalReason && ` — ${t.refusalReason}`}
                  </div>
                )}
                {t.cancelledAt && (
                  <div className="print-event-sub">
                    Cancelada em {formatPrintDateTime(t.cancelledAt)}
                    {t.cancelReason && ` — ${t.cancelReason}`}
                  </div>
                )}

                <table
                  className="print-table print-table--nested"
                  style={{ marginTop: "1.5mm" }}
                >
                  <colgroup>
                    <col style={{ width: "60%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>SKU</th>
                      <th style={{ textAlign: "right" }}>Qtd enviada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {t.items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.product.name}</td>
                        <td className="print-mono">{it.product.sku}</td>
                        <td className="print-col-qty">{it.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}
