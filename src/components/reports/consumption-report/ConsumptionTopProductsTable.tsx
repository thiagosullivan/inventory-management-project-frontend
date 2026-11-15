// src/components/reports/consumption-report/ConsumptionTopProductsTable.tsx
import { PriorityBadge } from "@/lib/report-badges";
import type { ProductConsumption } from "@/types/reports.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ConsumptionTopProductsTableProps {
  products: ProductConsumption[];
  title?: string;
  emptyMessage?: string;
}

export function ConsumptionTopProductsTable({
  products,
  title = "Produtos mais consumidos",
  emptyMessage = "Sem consumo no período.",
}: ConsumptionTopProductsTableProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">SKU</th>
              <th className="px-4 py-3 font-semibold text-right">Qtd.</th>
              <th className="px-4 py-3 font-semibold text-right">Valor</th>
              <th className="px-4 py-3 font-semibold text-right">Meses</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.productId} className="border-t">
                <td className="px-4 py-3">{p.productName}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.productSku}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {p.consumedQty}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatCentsToBRL(p.consumedValueInCents)}
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  {p.monthsWithConsumption}/{p.monthsInRange}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.priority && <PriorityBadge />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
