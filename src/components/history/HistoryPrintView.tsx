// src/components/history/HistoryPrintView.tsx
import type {
  HistoryEvent,
  HistoryMovementRef,
  MovementStatus,
  MovementType,
  TransferStatus,
} from "@/types/history.types";
import { formatPrintCents, formatPrintDateTime } from "@/lib/print/print-utils";

const TYPE_LABEL: Record<MovementType, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  TRANSFERENCIA: "Transferência",
};

const STATUS_LABEL: Record<MovementStatus, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

const TRANSFER_STATUS_LABEL: Record<TransferStatus, string> = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  RECUSADO: "Recusado",
};

function sectorsText(fromName: string | null, toName: string | null): string {
  return `${fromName ?? "—"} → ${toName ?? "—"}`;
}

interface HistoryPrintViewProps {
  events: HistoryEvent[];
  includeTransferMovements: boolean;
}

export function HistoryPrintView({
  events,
  includeTransferMovements,
}: HistoryPrintViewProps) {
  return (
    <table className="print-table">
      <colgroup>
        <col style={{ width: "16%" }} />
        <col style={{ width: "36%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "22%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>Data</th>
          <th>Evento</th>
          <th>Movimento</th>
          <th>Autor / Valor</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          return event.eventType === "MOVEMENT" ? (
            <MovementRow
              key={event.movement.id}
              movement={event.movement}
              addSpacer={!isLast}
            />
          ) : (
            <TransferRow
              key={event.transfer.id}
              transfer={event.transfer}
              movements={event.movements}
              includeMovements={includeTransferMovements}
              addSpacer={!isLast}
            />
          );
        })}
      </tbody>
    </table>
  );
}

// =============================
// Linha: Movement
// =============================

function MovementRow({
  movement: m,
  addSpacer,
}: {
  movement: HistoryMovementRef;
  addSpacer: boolean;
}) {
  return (
    <>
      <tr>
        <td className="print-col-date">{formatPrintDateTime(m.createdAt)}</td>
        <td>
          <div className="print-event-title">{m.product.name}</div>
          <div className="print-event-sub">
            {m.product.sku} · {STATUS_LABEL[m.status]} · {TYPE_LABEL[m.type]}
          </div>
        </td>
        <td>
          <div>
            {sectorsText(m.fromSector?.name ?? null, m.toSector?.name ?? null)}
          </div>
          <div className="print-event-sub print-mono">
            Qtd: {m.quantity}
            {m.unitPriceInCents !== null
              ? ` · ${formatPrintCents(m.unitPriceInCents)}`
              : ""}
          </div>
          {m.reason && (
            <div className="print-event-sub print-italic">
              Motivo: {m.reason}
            </div>
          )}
        </td>
        <td>
          <div>{m.createdBy.name ?? "—"}</div>
          {m.unitPriceInCents !== null && (
            <div className="print-event-sub print-mono">
              {formatPrintCents(m.unitPriceInCents)}
            </div>
          )}
        </td>
      </tr>
      {addSpacer && <SpacerRow />}
    </>
  );
}

// =============================
// Linha: Transfer (remessa)
// =============================

function TransferRow({
  transfer,
  movements,
  includeMovements,
  addSpacer,
}: {
  transfer: Extract<HistoryEvent, { eventType: "TRANSFER" }>["transfer"];
  movements: HistoryMovementRef[];
  includeMovements: boolean;
  addSpacer: boolean;
}) {
  // 🔹 Opção A — esconde TRANSFERENCIA quando existe SAIDA do mesmo produto
  //    (evita duplicação "saiu -1" + "transferência -1" no papel)
  const saidaProductIds = new Set(
    movements.filter((m) => m.type === "SAIDA").map((m) => m.product.id),
  );
  const visibleMovements = movements.filter(
    (m) => !(m.type === "TRANSFERENCIA" && saidaProductIds.has(m.product.id)),
  );
  const movementsCount = visibleMovements.length;

  const itemsPreview = transfer.items
    .slice(0, 3)
    .map((it) => `${it.product.name} (${it.quantity})`)
    .join(", ");
  const more = transfer.items.length > 3 ? "…" : "";

  return (
    <>
      <tr>
        <td className="print-col-date">
          {formatPrintDateTime(transfer.createdAt)}
        </td>
        <td>
          <div className="print-event-title">
            Remessa #{transfer.id.slice(0, 8)} · {transfer._count.items}{" "}
            {transfer._count.items <= 1 ? "item" : "itens"}
          </div>
          <div className="print-event-sub">
            {TRANSFER_STATUS_LABEL[transfer.status]} · Remessa
          </div>
          <div className="print-event-sub">
            Itens: {itemsPreview}
            {more}
          </div>
        </td>
        <td>
          <div>
            {sectorsText(transfer.fromSector.name, transfer.toSector.name)}
          </div>
          {transfer.reason && (
            <div className="print-event-sub print-italic">
              Motivo: {transfer.reason}
            </div>
          )}
          {transfer.refusalReason && (
            <div className="print-event-sub print-italic">
              Recusa: {transfer.refusalReason}
            </div>
          )}
          {transfer.cancelReason && (
            <div className="print-event-sub print-italic">
              Cancelamento: {transfer.cancelReason}
            </div>
          )}
        </td>
        <td>
          <div>{transfer.createdBy.name ?? "—"}</div>
          <div className="print-event-sub">
            {movementsCount} movimentaç{movementsCount === 1 ? "ão" : "ões"}
          </div>
        </td>
      </tr>

      {includeMovements && (
        <tr className="print-transfer-subrow">
          <td></td>
          <td colSpan={3}>
            <div className="print-transfer-movements">
              <p className="print-transfer-movements__title">
                Movimentações ({movementsCount})
              </p>
              {movementsCount === 0 ? (
                <p className="print-event-sub print-italic">
                  Sem movimentações registradas.
                </p>
              ) : (
                <table className="print-table print-table--nested">
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "30%" }} />
                    <col style={{ width: "20%" }} />
                  </colgroup>
                  <tbody>
                    {visibleMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="print-col-date">
                          {formatPrintDateTime(m.createdAt)}
                        </td>
                        <td>
                          <div className="print-event-title">
                            {m.product.name}
                          </div>
                          <div className="print-event-sub">
                            {m.product.sku} · {STATUS_LABEL[m.status]} ·{" "}
                            {TYPE_LABEL[m.type]}
                          </div>
                        </td>
                        <td>
                          <div>
                            {sectorsText(
                              m.fromSector?.name ?? null,
                              m.toSector?.name ?? null,
                            )}
                          </div>
                          <div className="print-event-sub print-mono">
                            Qtd: {m.quantity}
                            {m.unitPriceInCents !== null
                              ? ` · ${formatPrintCents(m.unitPriceInCents)}`
                              : ""}
                          </div>
                        </td>
                        <td>
                          <div>{m.createdBy.name ?? "—"}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}

      {addSpacer && <SpacerRow />}
    </>
  );
}

// =============================
// Espaçador vertical entre grupos
// =============================

function SpacerRow() {
  return (
    <tr className="print-spacer" aria-hidden>
      <td colSpan={4} />
    </tr>
  );
}
