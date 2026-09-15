import { Label, Pie, PieChart } from "recharts";
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
import type { CategoryDistributionItem } from "@/types/dashboard.types";

interface CategoryDonutChartProps {
  data: CategoryDistributionItem[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const totalProducts = data.reduce((acc, curr) => acc + curr.count, 0);

  const chartData = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.category})`,
  }));

  const donutChartConfig = data.reduce((config, item, index) => {
    config[item.category] = {
      label: item.category,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return config;
  }, {} as ChartConfig);

  return (
    <Card className="flex flex-col flex-1 min-h-[400px] shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle>Produtos por Categoria</CardTitle>
        <CardDescription>Distribuição proporcional do estoque</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex items-center justify-center">
        <ChartContainer
          config={donutChartConfig}
          className="mx-auto aspect-square w-full max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalProducts}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Total Itens
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
