// src/components/reports/consumption-report/ConsumptionBySectorBarChart.tsx
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { getChartColor } from "@/lib/chart-colors";
import type { ConsumptionSectorSummary } from "@/types/reports.types";

interface ConsumptionBySectorBarChartProps {
  data: ConsumptionSectorSummary[];
}

export function ConsumptionBySectorBarChart({
  data,
}: ConsumptionBySectorBarChartProps) {
  const navigate = useNavigate();

  // 🔹 Ordena desc para o bar horizontal ficar com o maior no topo
  const chartData = [...data]
    .sort((a, b) => b.totalConsumedQty - a.totalConsumedQty)
    .map((s, index) => ({
      sectorId: s.sectorId,
      sectorName: s.sectorName,
      totalConsumedQty: s.totalConsumedQty,
      // cor por setor (estável dentro do set, mas index-based no gráfico)
      fill: getChartColor(index),
    }));

  const chartConfig = chartData.reduce((config, item, index) => {
    config[item.sectorId] = {
      label: item.sectorName,
      color: getChartColor(index),
    };
    return config;
  }, {} as ChartConfig);

  function handleBarClick(payload: { sectorId?: string } | null) {
    if (payload?.sectorId) {
      navigate(`/reports/consumption/${payload.sectorId}`);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-medium text-lg">Consumo por setor</CardTitle>
        <CardDescription>
          Clique em uma barra para ver o detalhamento do setor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} className="stroke-muted/50" />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="sectorName"
              tickLine={false}
              axisLine={false}
              width={100}
              fontSize={12}
            />
            <ChartTooltip
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="totalConsumedQty"
              radius={[0, 6, 6, 0]}
              onClick={(data) => handleBarClick(data as { sectorId?: string })}
              className="cursor-pointer"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
