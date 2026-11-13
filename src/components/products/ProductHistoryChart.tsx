// src/components/products/ProductHistoryChart.tsx
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { StockHistoryEntry } from "@/types/products.types";

const chartConfig = {
  quantity: {
    label: "Saldo",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ProductHistoryChartProps {
  history: StockHistoryEntry[]; // ordem desc (mais recente primeiro)
}

/**
 * 🔹 Agrega o saldo por dia (último newQuantity de cada dia) e mostra
 *    os últimos 30 dias. Se o produto tiver poucos registros, mostra
 *    todos (sem agregar).
 */
export function ProductHistoryChart({ history }: ProductHistoryChartProps) {
  const data = useMemo(() => {
    if (history.length === 0) return [];

    // ordena asc (mais antigo primeiro)
    const asc = [...history].sort(
      (a, b) =>
        new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime(),
    );

    // se <= 30 registros, mostra todos (ponto por registro)
    if (asc.length <= 30) {
      return asc.map((h) => ({
        date: new Date(h.changedAt).toISOString(),
        label: new Date(h.changedAt).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        quantity: h.newQuantity,
      }));
    }

    // senão, agrega por dia (último newQuantity do dia)
    const byDay = new Map<string, number>();
    for (const h of asc) {
      const d = new Date(h.changedAt);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      byDay.set(key, h.newQuantity); // sobrescreve → fica o último
    }

    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30) // últimos 30 dias
      .map(([key, quantity]) => ({
        date: key,
        label: new Date(`${key}T00:00:00.000Z`).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
        }),
        quantity,
      }));
  }, [history]);

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-2">
        Evolução do saldo (últimos 30 dias)
      </h3>
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} className="stroke-muted/50" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
            allowDecimals={false}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Line
            dataKey="quantity"
            type="monotone"
            stroke="var(--color-quantity)"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
