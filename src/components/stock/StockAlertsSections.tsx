import type { StockMetricsResponse } from "@/types/stock.types";
import { StockAlertSection } from "./StockAlertSection";

interface StockAlertsSectionsProps {
  details: StockMetricsResponse["details"];
}

export function StockAlertsSections({ details }: StockAlertsSectionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <StockAlertSection
        title="Estoque baixo"
        description="Produtos com quantidade igual ou abaixo do mínimo"
        items={details.productsWithLowStock}
        variant="warning"
        showMinStock
        emptyMessage="Nenhum produto com estoque baixo"
        seeAllHref="/products?isLowStock=true"
        icon="alert"
      />

      <StockAlertSection
        title="Vencendo em 30 dias"
        description="Produtos que vencem nos próximos 30 dias"
        items={details.productsExpiringSoon}
        variant="warning"
        showExpiryDate
        emptyMessage="Nenhum produto vencendo em 30 dias"
        seeAllHref="/products?isExpiring=true"
        icon="clock"
      />

      <StockAlertSection
        title="Vencidos"
        description="Produtos com data de validade expirada"
        items={details.productsExpired}
        variant="destructive"
        showExpiryDate
        emptyMessage="Nenhum produto vencido"
        icon="calendar"
      />

      <StockAlertSection
        title="Sem estoque"
        description="Produtos com quantidade zerada"
        items={details.productsOutOfStock}
        variant="destructive"
        emptyMessage="Nenhum produto sem estoque"
        icon="package"
      />
    </div>
  );
}
