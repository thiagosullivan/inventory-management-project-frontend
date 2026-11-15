// src/components/reports/consumption-report/ConsumptionMonthlyLineChart.tsx
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ProductConsumptionMonthly } from "@/types/reports.types";

interface ConsumptionMonthlyLineChartProps {
  monthly: ProductConsumptionMonthly[];
  sectorName: string;
}

const monthlyChartConfig: ChartConfig = {
  consumedQty: {
    label: "Consumo",
    color: "hsl(var(--chart-1))",
  },
};

function formatMonthLabel(month: string): string {
  // YYYY-MM → "MM/YYYY"
  const [y, m] = month.split("-");
  if (!y || !m) return month;
  return `${m}/${y}`;
}

export function ConsumptionMonthlyLineChart({
  monthly,
  sectorName,
}: ConsumptionMonthlyLineChartProps) {
  const data = monthly.map((item) => ({
    ...item,
    label: formatMonthLabel(item.month),
  }));

  const total = data.reduce((acc, d) => acc + d.consumedQty, 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-medium text-lg">
          Consumo mensal — {sectorName}
        </CardTitle>
        <CardDescription>Total no período: {total} unidades</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={monthlyChartConfig}
          className="h-[260px] w-full"
        >
          <LineChart data={data} margin={{ left: 12, right: 12, top: 10 }}>
            <CartesianGrid vertical={false} className="stroke-muted/50" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="consumedQty"
              type="monotone"
              stroke="var(--color-consumedQty)"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
