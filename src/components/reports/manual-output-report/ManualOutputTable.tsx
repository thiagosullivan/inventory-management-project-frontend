// src/components/reports/manual-output-report/ManualOutputTable.tsx

import type { ManualOutputMovement } from "@/types/reports.types";
import { formatCentsToBRL } from "@/utils/currency";

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

interface ManualOutputTableProps {
  movements: ManualOutputMovement[];
  isLoading: boolean;
  isError: boolean;
}

const COL_COUNT = 7;

export function ManualOutputTable({
  movements,
  isLoading,
  isError,
}: ManualOutputTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Data</th>
            <th className="px-4 py-3 font-semibold">Produto</th>
            <th className="px-4 py-3 font-semibold">SKU</th>
            <th className="px-4 py-3 font-semibold">Origem</th>
            <th className="px-4 py-3 font-semibold">Autor</th>
            <th className="px-4 py-3 font-semibold">Motivo</th>
            <th className="px-4 py-3 font-semibold text-right">Qtd. / Valor</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td
                colSpan={COL_COUNT}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Carregando saídas manuais...
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
          {!isLoading && !isError && movements.length === 0 && (
            <tr>
              <td
                colSpan={COL_COUNT}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                Nenhuma saída manual no período.
              </td>
            </tr>
          )}

          {movements.map((m) => (
            <tr key={m.id} className="border-t">
              <td className="px-4 py-3">{formatDateTime(m.createdAt)}</td>
              <td className="px-4 py-3">{m.productName}</td>
              <td className="px-4 py-3 font-mono text-xs">{m.productSku}</td>
              <td className="px-4 py-3">{m.fromSectorName ?? "—"}</td>
              <td className="px-4 py-3">{m.createdByName ?? "—"}</td>
              <td className="px-4 py-3">
                {m.reason ? (
                  <span
                    className="block max-w-[240px] truncate"
                    title={m.reason}
                  >
                    {m.reason}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="font-mono">{Math.abs(m.quantity)}</div>
                <div className="text-xs text-muted-foreground">
                  {formatCentsToBRL(m.totalValueInCents)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
