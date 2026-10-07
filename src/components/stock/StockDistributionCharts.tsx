import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
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
import type { StockMetricsResponse } from "@/types/stock.types";

interface StockDistributionChartsProps {
  distribution: StockMetricsResponse["distribution"];
}

export function StockDistributionCharts({
  distribution,
}: StockDistributionChartsProps) {
  const { byCategory, byLocation, bySupplier } = distribution;

  // ===== Donut de categoria =====
  const totalUnits = byCategory.reduce((acc, curr) => acc + curr.totalUnits, 0);

  const categoryChartData = byCategory.map((item) => ({
    ...item,
    fill: `var(--color-${item.categoryId})`,
  }));

  const categoryChartConfig = byCategory.reduce((config, item, index) => {
    config[item.categoryId] = {
      label: item.categoryName,
      color: getChartColor(index),
    };
    return config;
  }, {} as ChartConfig);

  // ===== Bar de localização =====
  const locationChartData = byLocation.map((item, index) => ({
    ...item,
    fill: `var(--color-loc-${index})`,
  }));

  const locationChartConfig = byLocation.reduce((config, item, index) => {
    config[`loc-${index}`] = {
      label: item.location,
      color: getChartColor(index),
    };
    return config;
  }, {} as ChartConfig);

  // ===== Bar de fornecedor =====
  const supplierChartData = bySupplier.map((item, index) => ({
    ...item,
    fill: `var(--color-sup-${index})`,
  }));

  const supplierChartConfig = bySupplier.reduce((config, item, index) => {
    config[`sup-${index}`] = {
      label: item.supplier,
      color: getChartColor(index),
    };
    return config;
  }, {} as ChartConfig);

  return (
    <div className="flex flex-col gap-4">
      {/* ===== Donut de categoria (full width) ===== */}
      <Card className="flex flex-col shadow-lg">
        <CardHeader className="items-center pb-0">
          <CardTitle className="font-medium text-lg">
            Unidades por categoria
          </CardTitle>
          <CardDescription>
            Distribuição proporcional do estoque
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sem dados
            </p>
          ) : (
            <ChartContainer
              config={categoryChartConfig}
              className="mx-auto aspect-square w-full max-w-[320px] max-h-[320px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                  wrapperStyle={{ width: "auto", maxWidth: "none" }}
                />
                <Pie
                  data={categoryChartData}
                  dataKey="totalUnits"
                  nameKey="categoryId"
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
                              {totalUnits}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs"
                            >
                              Unidades
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* ===== 2 bars lado a lado ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar de localização */}
        <Card className="flex flex-col shadow-lg">
          <CardHeader className="items-center pb-0">
            <CardTitle className="font-medium text-lg">
              Unidades por localização
            </CardTitle>
            <CardDescription>Top 10 locais com mais estoque</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {byLocation.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem dados
              </p>
            ) : (
              <ChartContainer
                config={locationChartConfig}
                className="mx-auto w-full h-[280px]"
              >
                <BarChart
                  data={locationChartData}
                  layout="vertical"
                  margin={{ left: 8, right: 8 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="location"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    wrapperStyle={{ width: "auto", maxWidth: "none" }}
                  />
                  <Bar dataKey="totalUnits" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar de fornecedor */}
        <Card className="flex flex-col shadow-lg">
          <CardHeader className="items-center pb-0">
            <CardTitle className="font-medium text-lg">
              Unidades por fornecedor
            </CardTitle>
            <CardDescription>
              Top 10 fornecedores com mais estoque
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 min-w-[250px]">
            {bySupplier.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem dados
              </p>
            ) : (
              <ChartContainer
                config={supplierChartConfig}
                className="mx-auto w-full h-[280px]"
              >
                <BarChart
                  data={supplierChartData}
                  layout="vertical"
                  margin={{ left: 8, right: 8 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="supplier"
                    width={110}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    wrapperStyle={{ width: "auto", maxWidth: "none" }}
                  />
                  <Bar dataKey="totalUnits" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
