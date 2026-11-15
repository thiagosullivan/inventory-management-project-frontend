// src/components/reports/requests-report/RequestsReportSummary.tsx
import { Card, CardContent } from "@/components/ui/card";
import type { RequestReportSummary as SummaryData } from "@/types/reports.types";
import { FulfillmentBadge } from "@/lib/report-badges";

interface SummaryItem {
  label: string;
  value: string;
  hint?: React.ReactNode;
}

interface RequestsReportSummaryProps {
  summary: SummaryData;
}

export function RequestsReportSummary({ summary }: RequestsReportSummaryProps) {
  const items: SummaryItem[] = [
    {
      label: "Pedidos",
      value: String(summary.totalRequests),
    },
    {
      label: "Qtd. pedida",
      value: String(summary.totalRequestedQty),
    },
    {
      label: "Qtd. enviada",
      value: String(summary.totalSentQty),
    },
    {
      label: "Atendimento geral",
      value: "",
      hint: <FulfillmentBadge pct={summary.overallFulfillmentPct} />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex flex-col gap-1 p-5">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.label}
            </span>
            {item.value !== "" && (
              <span className="text-2xl font-bold text-primary">
                {item.value}
              </span>
            )}
            {item.hint && <div className="mt-1">{item.hint}</div>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
