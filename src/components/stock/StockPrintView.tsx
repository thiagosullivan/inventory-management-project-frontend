// src/components/stock/StockPrintView.tsx
import type {
  StockAlertProduct,
  StockMetricsResponse,
} from "@/types/stock.types";
import { formatDate } from "@/lib/format-date";

interface StockPrintViewProps {
  data: StockMetricsResponse;
  includeDistribution: boolean;
}

// =============================
// Bloco de resumo (5 cards → 1 linha)
// =============================

function SummaryBlock({ data }: { data: StockMetricsResponse }) {
  const { summary, stockStatus, expiryStatus } = data;

  const items = [
    {
      label: "Total de produtos",
      value: summary.totalProducts,
      sub: `${summary.productsWithStock} com estoque · ${summary.productsWithoutStock} sem estoque`,
    },
    {
      label: "Total de unidades",
      value: summary.totalUnits,
      sub: `Média de ${summary.averageStockPerProduct} por produto`,
    },
    {
      label: "Saúde do estoque",
      value: stockStatus.healthy,
      sub: `${stockStatus.low} baixos · ${stockStatus.outOfStock} sem estoque`,
    },
    {
      label: "Validade",
      value: expiryStatus.expired,
      sub: `${expiryStatus.expiringSoon} vencendo · ${expiryStatus.noExpiryDate} sem validade`,
    },
    {
      label: "Excesso",
      value: stockStatus.overStock,
      sub: `${stockStatus.noMinStockDefined} sem mínimo definido`,
    },
  ];

  return (
    <section className="print-section">
      <h2 className="print-section__title">Resumo</h2>
      <table className="print-table print-table--summary">
        <tbody>
          <tr>
            {items.map((it, i) => (
              <td key={i} className="print-summary-cell">
                <div className="print-field__label">{it.label}</div>
                <div className="print-summary-value">{it.value}</div>
                <div className="print-event-sub">{it.sub}</div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </section>
  );
}

// =============================
// Seção de alerta (lista de produtos)
// =============================

interface AlertSectionProps {
  title: string;
  description: string;
  items: StockAlertProduct[];
  showMinStock?: boolean;
  showExpiryDate?: boolean;
}

function AlertSection({
  title,
  description,
  items,
  showMinStock,
  showExpiryDate,
}: AlertSectionProps) {
  return (
    <section className="print-section">
      <h2 className="print-section__title">
        {title} ({items.length})
      </h2>
      <p
        className="print-event-sub print-italic"
        style={{ marginBottom: "2mm" }}
      >
        {description}
      </p>

      {items.length === 0 ? (
        <p className="print-empty">Nenhum produto nesta seção.</p>
      ) : (
        <table className="print-table">
          <colgroup>
            <col style={{ width: "40%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Produto</th>
              <th>SKU</th>
              <th style={{ textAlign: "right" }}>Qtd</th>
              <th>Validade / Local</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="print-mono">{p.sku ?? "—"}</td>
                <td className="print-col-qty">
                  {p.quantity}
                  {showMinStock && p.minStock !== null && (
                    <span className="print-event-sub"> / {p.minStock}</span>
                  )}
                </td>
                <td>
                  {showExpiryDate && p.expiryDate ? (
                    <span className="print-mono">
                      {formatDate(p.expiryDate)}
                    </span>
                  ) : p.location ? (
                    <span className="print-event-sub">{p.location}</span>
                  ) : (
                    <span className="print-event-sub print-italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

// =============================
// Bloco de distribuição (categoria, local, fornecedor)
// =============================

function DistributionBlock({ data }: { data: StockMetricsResponse }) {
  const { byCategory, byLocation, bySupplier } = data.distribution;

  const renderTable = (
    title: string,
    rows: { label: string; count: number; totalUnits: number }[],
  ) => (
    <section className="print-section">
      <h2 className="print-section__title">{title}</h2>
      {rows.length === 0 ? (
        <p className="print-empty">Sem dados.</p>
      ) : (
        <table className="print-table">
          <colgroup>
            <col style={{ width: "60%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: "right" }}>Produtos</th>
              <th style={{ textAlign: "right" }}>Unidades</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.label}</td>
                <td className="print-col-qty">{r.count}</td>
                <td className="print-col-qty">{r.totalUnits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );

  return (
    <>
      {renderTable(
        "Distribuição por categoria",
        byCategory.map((c) => ({
          label: c.categoryName,
          count: c.count,
          totalUnits: c.totalUnits,
        })),
      )}
      {renderTable(
        "Distribuição por localização",
        byLocation.map((l) => ({
          label: l.location,
          count: l.count,
          totalUnits: l.totalUnits,
        })),
      )}
      {renderTable(
        "Distribuição por fornecedor",
        bySupplier.map((s) => ({
          label: s.supplier,
          count: s.count,
          totalUnits: s.totalUnits,
        })),
      )}
    </>
  );
}

// =============================
// Component principal
// =============================

export function StockPrintView({
  data,
  includeDistribution,
}: StockPrintViewProps) {
  const { details } = data;

  return (
    <div className="print-product">
      <SummaryBlock data={data} />

      <AlertSection
        title="Estoque baixo"
        description="Produtos com quantidade igual ou abaixo do mínimo"
        items={details.productsWithLowStock}
        showMinStock
      />

      <AlertSection
        title="Vencendo em 30 dias"
        description="Produtos que vencem nos próximos 30 dias"
        items={details.productsExpiringSoon}
        showExpiryDate
      />

      <AlertSection
        title="Vencidos"
        description="Produtos com data de validade expirada"
        items={details.productsExpired}
        showExpiryDate
      />

      <AlertSection
        title="Sem estoque"
        description="Produtos com quantidade zerada"
        items={details.productsOutOfStock}
      />

      {includeDistribution && <DistributionBlock data={data} />}
    </div>
  );
}
