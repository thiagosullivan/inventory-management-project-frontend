import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { PackageX } from "lucide-react";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { DailyMovementItem } from "@/types/dashboard.types";

interface MovementLineChartProps {
  data: DailyMovementItem[];
}

const lineChartConfig = {
  entries: {
    label: "Entradas",
    color: "hsl(var(--chart-1))",
  },
  exits: {
    label: "Saídas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function MovementLineChart({ data }: MovementLineChartProps) {
  const last7DaysData = data.slice(-7).map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    }),
  }));

  const totalMovements = last7DaysData.reduce(
    (acc, item) => acc + item.entries + item.exits,
    0,
  );

  const hasNoMovements = totalMovements === 0;

  return (
    <Card className="w-full max-w-[70%] min-h-[400px] shadow-lg">
      <CardHeader>
        <CardTitle className="font-medium text-lg">
          Movimentação dos Últimos 7 Dias
        </CardTitle>
        <CardDescription>
          Comparativo diário entre entradas e saídas
        </CardDescription>
      </CardHeader>
      <CardContent className="flex max-h-[300px] min-h-[250px]  flex-col items-center justify-center">
        {hasNoMovements ? (
          <div className="flex flex-col items-center justify-center text-center p-6 animate-fade-in">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PackageX className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              Sem movimentações
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
              Nenhum produto deu entrada ou saída do seu estoque nos últimos 7
              dias.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={lineChartConfig}
            className="min-h-[300px] w-full"
          >
            <LineChart
              data={last7DaysData}
              margin={{ left: 12, right: 12, top: 10 }}
            >
              <CartesianGrid vertical={false} className="stroke-muted/50" />
              <XAxis
                dataKey="formattedDate"
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
                dataKey="entries"
                type="monotone"
                stroke="var(--color-entries)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                dataKey="exits"
                type="monotone"
                stroke="var(--color-exits)"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
