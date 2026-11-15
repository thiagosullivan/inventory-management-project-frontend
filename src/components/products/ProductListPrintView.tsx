import type { Product } from "@/types/products.types";
import { formatPrintCents } from "@/lib/print/print-utils";
import { formatDate } from "@/lib/format-date";

interface ProductListPrintViewProps {
  products: Product[];
  includeDetails: boolean;
}

export function ProductListPrintView({
  products,
  includeDetails,
}: ProductListPrintViewProps) {
  return (
    <table className="print-table">
      <colgroup>
        {/* Se incluir detalhes, 5 colunas. Se não, 4 (esconde categoria/local) */}
        <col style={{ width: "25%" }} />
        <col style={{ width: includeDetails ? "15%" : "0%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "20%" }} />
        <col style={{ width: "20%" }} />
      </colgroup>
      <thead>
        <tr>
          <th>Produto</th>
          {includeDetails && <th>Categoria</th>}
          <th style={{ textAlign: "right" }}>Estoque</th>
          <th style={{ textAlign: "right" }}>Preço</th>
          <th>Validade / Local</th>
        </tr>
      </thead>
      <tbody>
        {products.map((p) => (
          <tr key={p.id}>
            <td>
              <div className="print-event-title">{p.name}</div>
              <div className="print-event-sub print-mono">
                {p.sku} · {p.barcode}
              </div>
            </td>

            {includeDetails && (
              <td>
                <div>{p.category?.name ?? "—"}</div>
              </td>
            )}

            <td style={{ textAlign: "right" }}>
              <div className="print-mono">{p.quantity} un.</div>
              {p.minStock !== null && (
                <div className="print-event-sub print-mono text-muted-foreground">
                  Mín: {p.minStock}
                </div>
              )}
            </td>

            <td style={{ textAlign: "right" }}>
              <div className="print-mono">
                {formatPrintCents(p.priceInCents)}
              </div>
              {p.avgPriceInCents !== null && (
                <div className="print-event-sub print-mono text-muted-foreground">
                  Média: {formatPrintCents(p.avgPriceInCents)}
                </div>
              )}
            </td>

            <td>
              {p.expiryDate ? (
                <div className="print-mono">{formatDate(p.expiryDate)}</div>
              ) : (
                <div className="print-event-sub print-italic">Sem validade</div>
              )}
              {p.location && (
                <div className="print-event-sub text-muted-foreground">
                  {p.location}
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
