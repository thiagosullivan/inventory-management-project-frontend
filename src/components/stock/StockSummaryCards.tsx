import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockMetricsResponse } from "@/types/stock.types";

interface StockSummaryCardsProps {
  summary: StockMetricsResponse["summary"];
  stockStatus: StockMetricsResponse["stockStatus"];
  expiryStatus: StockMetricsResponse["expiryStatus"];
}

export function StockSummaryCards({
  summary,
  stockStatus,
  expiryStatus,
}: StockSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.totalProducts}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {summary.productsWithStock} com estoque ·{" "}
            {summary.productsWithoutStock} sem estoque
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de unidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{summary.totalUnits}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Média de {summary.averageStockPerProduct} por produto
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saúde do estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stockStatus.healthy}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stockStatus.low} baixos · {stockStatus.outOfStock} sem estoque
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Validade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{expiryStatus.expired}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {expiryStatus.expiringSoon} vencendo · {expiryStatus.noExpiryDate}{" "}
            sem validade
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Excesso de estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stockStatus.overStock}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stockStatus.noMinStockDefined} sem mínimo definido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
