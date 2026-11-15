// src/components/reports/consumption-report/ConsumptionSummaryCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { ConsumptionGlobalSummary } from "@/types/reports.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ConsumptionSummaryCardsProps {
  summary: ConsumptionGlobalSummary;
}

export function ConsumptionSummaryCards({
  summary,
}: ConsumptionSummaryCardsProps) {
  const items = [
    { label: "Qtd. consumida", value: String(summary.totalConsumedQty) },
    {
      label: "Valor consumido",
      value: formatCentsToBRL(summary.totalConsumedValueInCents),
    },
    { label: "Setores", value: String(summary.totalSectors) },
    { label: "Produtos", value: String(summary.totalProducts) },
    {
      label: "Prioritários",
      value: String(summary.priorityProductsCount),
      highlight: summary.priorityProductsCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col gap-1 p-5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.label}
            </span>
            <span
              className={`text-2xl font-bold ${
                item.highlight ? "text-red-600" : "text-primary"
              }`}
            >
              {item.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
