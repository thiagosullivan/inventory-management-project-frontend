// src/components/reports/requests-report/RequestsReportTable.tsx
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FulfillmentBadge } from "@/lib/report-badges";
import type {
  RequestReportRow,
  ReportRequestStatusFilter,
} from "@/types/reports.types";

const STATUS_LABEL: Record<ReportRequestStatusFilter, string> = {
  PENDENTE: "Pendente",
  EM_ATENDIMENTO: "Em atendimento",
  ATENDIDO: "Atendido",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
};

const STATUS_CLASS: Record<ReportRequestStatusFilter, string> = {
  PENDENTE: "bg-amber-100 text-amber-900 border-amber-300",
  EM_ATENDIMENTO: "bg-sky-100 text-sky-900 border-sky-300",
  ATENDIDO: "bg-emerald-100 text-emerald-900 border-emerald-300",
  RECUSADO: "bg-red-100 text-red-900 border-red-300",
  CANCELADO: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
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

interface RequestsReportTableProps {
  rows: RequestReportRow[];
  isLoading: boolean;
  isError: boolean;
}

export function RequestsReportTable({
  rows,
  isLoading,
  isError,
}: RequestsReportTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const COL_COUNT = 7;

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="w-10 px-2 py-3"></th>
            <th className="px-4 py-3 font-semibold">Data</th>
            <th className="px-4 py-3 font-semibold">Setor</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Pedida</th>
            <th className="px-4 py-3 font-semibold text-right">Enviada</th>
            <th className="px-4 py-3 font-semibold text-right">Atendimento</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={COL_COUNT}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Carregando pedidos...
              </td>
            </tr>
          )}
          {isError && !isLoading && (
            <tr>
              <td
                colSpan={COL_COUNT}
                className="px-4 py-8 text-center text-destructive"
              >
                Erro ao carregar o relatório.
              </td>
            </tr>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <tr>
              <td
                colSpan={COL_COUNT}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Nenhum pedido encontrado no período.
              </td>
            </tr>
          )}

          {rows.map((row) => {
            const isOpen = expanded.has(row.id);
            const itemsCount = row.items.length;
            return (
              <Fragment key={row.id}>
                <tr className="border-t">
                  <td className="px-2 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={itemsCount === 0}
                      onClick={() => toggle(row.id)}
                      title={isOpen ? "Recolher itens" : "Ver itens"}
                      className="cursor-pointer"
                    >
                      {isOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </Button>
                  </td>
                  <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div>{row.sectorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.createdByName ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[row.status]}`}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {row.totals.requestedQty}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {row.totals.sentQty}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <FulfillmentBadge pct={row.totals.fulfillmentPct} />
                  </td>
                </tr>

                {isOpen && itemsCount > 0 && (
                  <tr className="border-t bg-muted/20">
                    <td></td>
                    <td colSpan={COL_COUNT - 1} className="px-4 py-3">
                      <table className="w-full text-xs">
                        <thead className="text-left text-muted-foreground">
                          <tr>
                            <th className="py-1 font-medium">Produto</th>
                            <th className="py-1 font-medium">SKU</th>
                            <th className="py-1 font-medium text-right">
                              Pedida
                            </th>
                            <th className="py-1 font-medium text-right">
                              Enviada
                            </th>
                            <th className="py-1 font-medium text-right">
                              Atendimento
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {row.items.map((it) => (
                            <tr
                              key={`${row.id}-${it.productId}`}
                              className="border-t"
                            >
                              <td className="py-1">{it.productName}</td>
                              <td className="py-1 font-mono">
                                {it.productSku}
                              </td>
                              <td className="py-1 text-right font-mono">
                                {it.requestedQty}
                              </td>
                              <td className="py-1 text-right font-mono">
                                {it.sentQty}
                              </td>
                              <td className="py-1 text-right">
                                <Badge variant="outline" className="font-mono">
                                  {it.fulfillmentPct.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
