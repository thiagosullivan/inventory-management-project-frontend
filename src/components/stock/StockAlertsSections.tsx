import type { StockMetricsResponse } from "@/types/stock.types";
import { StockAlertSection } from "./StockAlertSection";

interface StockAlertsSectionsProps {
  details: StockMetricsResponse["details"];
}

export function StockAlertsSections({ details }: StockAlertsSectionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      <StockAlertSection
        title="Estoque baixo"
        description="Produtos com quantidade igual ou abaixo do mínimo"
        items={details.productsWithLowStock}
        variant="warning"
        showMinStock
        emptyMessage="Nenhum produto com estoque baixo"
        seeAllHref="/produtos?isLowStock=true"
        icon="alert"
      />

      <StockAlertSection
        title="Vencendo em 30 dias"
        description="Produtos que vencem nos próximos 30 dias"
        items={details.productsExpiringSoon}
        variant="warning"
        showExpiryDate
        emptyMessage="Nenhum produto vencendo em 30 dias"
        seeAllHref="/produtos?isExpiring=true"
        icon="clock"
      />

      <StockAlertSection
        title="Vencidos"
        description="Produtos com data de validade expirada"
        items={details.productsExpired}
        variant="destructive"
        showExpiryDate
        emptyMessage="Nenhum produto vencido"
        seeAllHref="/produtos?isExpired=true"
        icon="calendar"
      />

      <StockAlertSection
        title="Sem estoque"
        description="Produtos com quantidade zerada"
        items={details.productsOutOfStock}
        variant="destructive"
        emptyMessage="Nenhum produto sem estoque"
        seeAllHref="/produtos?maxQuantity=0"
        icon="package"
      />
    </div>
  );
}
