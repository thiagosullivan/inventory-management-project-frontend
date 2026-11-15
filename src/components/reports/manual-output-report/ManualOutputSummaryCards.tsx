// src/components/reports/manual-output-report/ManualOutputSummaryCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { ManualOutputSummary } from "@/types/reports.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ManualOutputSummaryCardsProps {
  summary: ManualOutputSummary;
}

export function ManualOutputSummaryCards({
  summary,
}: ManualOutputSummaryCardsProps) {
  const items = [
    { label: "Movimentações", value: String(summary.totalMovements) },
    { label: "Qtd. total", value: String(summary.totalQty) },
    {
      label: "Valor total",
      value: formatCentsToBRL(summary.totalValueInCents),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col gap-1 p-5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.label}
            </span>
            <span className="text-2xl font-bold text-primary">
              {item.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
