// src/components/reports/requests-report/RequestsReportPrintView.tsx
import { PrintLayout } from "@/components/print/PrintLayout";
import { formatPrintDateTime } from "@/lib/print/print-utils";
import type {
  ReportRequestStatusFilter,
  RequestReportResponse,
} from "@/types/reports.types";

const STATUS_LABEL: Record<ReportRequestStatusFilter, string> = {
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

interface RequestsReportPrintViewProps {
  data: RequestReportResponse;
}

export function RequestsReportPrintView({
  data,
}: RequestsReportPrintViewProps) {
  const { period, requests, summary } = data;

  // 🔹 Meta lines: período + resumo compacto
  const metaLines = [
    `Período: ${formatPrintDateTime(period.dateFrom)} — ${formatPrintDateTime(period.dateTo)}`,
    `Pedidos: ${summary.totalRequests} · Pedida: ${summary.totalRequestedQty} · Enviada: ${summary.totalSentQty} · Atendimento: ${summary.overallFulfillmentPct.toFixed(1)}%`,
  ];

  return (
    <PrintLayout
      title="Relatório de pedidos"
      metaLines={metaLines}
      totalCount={requests.length}
      generatedAt={new Date()}
      itemLabel="pedido"
    >
      {/* Tabela principal */}
      <table className="print-table">
        <colgroup>
          <col style={{ width: "16%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "16%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Data</th>
            <th>Setor / Autor</th>
            <th>Status</th>
            <th className="text-right">Pedida</th>
            <th className="text-right">Enviada</th>
            <th className="text-right">Atend.</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((row) => (
            <RequestRow key={row.id} row={row} />
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={6} className="print-event-sub print-italic">
                Nenhum pedido no período.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </PrintLayout>
  );
}

function RequestRow({
  row,
}: {
  row: RequestReportResponse["requests"][number];
}) {
  return (
    <>
      <tr>
        <td className="print-col-date">{formatPrintDateTime(row.createdAt)}</td>
        <td>
          <div className="print-event-title">{row.sectorName}</div>
          <div className="print-event-sub">{row.createdByName ?? "—"}</div>
        </td>
        <td>{STATUS_LABEL[row.status]}</td>
        <td className="text-right print-mono">{row.totals.requestedQty}</td>
        <td className="text-right print-mono">{row.totals.sentQty}</td>
        <td className="text-right print-mono">
          {row.totals.fulfillmentPct.toFixed(1)}%
        </td>
      </tr>

      {row.items.length > 0 && (
        <tr className="print-transfer-subrow">
          <td></td>
          <td colSpan={5}>
            <div className="print-transfer-movements">
              <p className="print-transfer-movements__title">
                Itens ({row.items.length})
              </p>
              <table className="print-table print-table--nested">
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "14%" }} />
                </colgroup>
                <tbody>
                  {row.items.map((it) => (
                    <tr key={it.productId}>
                      <td>{it.productName}</td>
                      <td className="print-mono">{it.productSku}</td>
                      <td className="text-right print-mono">
                        {it.requestedQty}
                      </td>
                      <td className="text-right print-mono">{it.sentQty}</td>
                      <td className="text-right print-mono">
                        {it.fulfillmentPct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
