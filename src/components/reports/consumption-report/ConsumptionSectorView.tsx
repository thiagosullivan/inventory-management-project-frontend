// src/components/reports/consumption-report/ConsumptionSectorView.tsx
import { ChevronLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ConsumptionMonthlyLineChart } from "./ConsumptionMonthlyLineChart";
import { ConsumptionTopProductsTable } from "./ConsumptionTopProductsTable";
import { useConsumptionSectorReport } from "@/hooks/useConsumptionReport";

import {
  parseConsumptionSectorReportFilters,
  serializeConsumptionSectorReportFilters,
} from "@/lib/reports-query-params";
import type {
  ConsumptionSectorReportFilters,
  ProductConsumptionMonthly,
} from "@/types/reports.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ConsumptionSectorViewProps {
  sectorId: string;
}

export function ConsumptionSectorView({
  sectorId,
}: ConsumptionSectorViewProps) {
  const [searchParams] = useSearchParams();
  const filters: ConsumptionSectorReportFilters =
    parseConsumptionSectorReportFilters(searchParams);

  // 🔹 Reusa os mesmos query params da tela global (dateFrom/dateTo/priorityThreshold/limit)
  const sectorQuery = useConsumptionSectorReport(sectorId, filters);
  const data = sectorQuery.data;

  if (sectorQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Carregando detalhamento do setor...
      </p>
    );
  }

  if (sectorQuery.isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Erro ao carregar detalhamento do setor.
      </p>
    );
  }

  // 🔹 Agrega monthlyBreakdown de todos os produtos em uma série única
  const monthlyMap = new Map<string, ProductConsumptionMonthly>();
  for (const product of data.products) {
    for (const item of product.monthlyBreakdown) {
      const current = monthlyMap.get(item.month);
      if (current) {
        current.consumedQty += item.consumedQty;
        current.consumedValueInCents += item.consumedValueInCents;
      } else {
        monthlyMap.set(item.month, { ...item });
      }
    }
  }
  const monthly = Array.from(monthlyMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month),
  );

  const summaryCards = [
    { label: "Qtd. consumida", value: String(data.summary.totalConsumedQty) },
    {
      label: "Valor consumido",
      value: formatCentsToBRL(data.summary.totalConsumedValueInCents),
    },
    { label: "Produtos", value: String(data.summary.productsCount) },
    { label: "Meses no período", value: String(data.summary.monthsInRange) },
    {
      label: "Prioritários",
      value: String(data.summary.priorityProductsCount),
      highlight: data.summary.priorityProductsCount > 0,
    },
  ];

  const backParams =
    serializeConsumptionSectorReportFilters(filters).toString();
  const backUrl = backParams
    ? `/reports/consumo?${backParams}`
    : "/reports/consumo";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link to={backUrl} className={buttonVariants({ variant: "ghost" })}>
          <ChevronLeft size={16} className="mr-2" />
          Voltar para o consumo global
        </Link>
        <span className="text-sm text-muted-foreground">
          Setor: <strong>{data.sector.name}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((item) => (
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

      <ConsumptionMonthlyLineChart
        monthly={monthly}
        sectorName={data.sector.name}
      />

      <ConsumptionTopProductsTable
        products={data.products}
        title="Produtos do setor"
        emptyMessage="Setor sem consumo no período."
      />
    </div>
  );
}
