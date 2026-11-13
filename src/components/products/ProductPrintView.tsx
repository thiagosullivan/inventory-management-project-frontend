// src/components/products/ProductPrintView.tsx
import type {
  MovementType,
  ProductDetailResponse,
  StockHistoryEntry,
  MovementResponse,
} from "@/types/products.types";
import { formatPrintCents, formatPrintDateTime } from "@/lib/print/print-utils";
import {
  getHistoryEventKind,
  HISTORY_EVENT_LABEL,
} from "@/lib/stock-history-badge";

const TYPE_LABEL: Record<MovementType, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  TRANSFERENCIA: "Transferência",
};

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`print-field${full ? " print-field--full" : ""}`}>
      <div className="print-field__label">{label}</div>
      <div className="print-field__value">{value || "—"}</div>
    </div>
  );
}

function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

interface ProductPrintViewProps {
  product: ProductDetailResponse;
  movements: MovementResponse[];
  history: StockHistoryEntry[];
  includeLists: boolean;
}

export function ProductPrintView({
  product,
  movements,
  history,
  includeLists,
}: ProductPrintViewProps) {
  return (
    <div className="print-product">
      {/* ---- Detalhes ---- */}
      <section className="print-section">
        <h2 className="print-section__title">Detalhes do produto</h2>

        <div className="print-grid-2">
          <Field label="Nome" value={product.name} />
          <Field label="SKU" value={product.sku} />
          <Field label="Código de barras" value={product.barcode} />
          <Field label="Categoria" value={product.category?.name ?? "—"} />
          <Field
            label="Preço de compra"
            value={formatPrintCents(product.priceInCents)}
          />
          <Field
            label="Média ponderada (custo em estoque)"
            value={formatPrintCents(product.avgPriceInCents)}
          />
          <Field label="Quantidade atual" value={product.quantity} />
          <Field label="Estoque mínimo" value={product.minStock ?? "—"} />
          <Field label="Estoque máximo" value={product.maxStock ?? "—"} />
          <Field label="Validade" value={formatDateBR(product.expiryDate)} />
          <Field label="Lote" value={product.batchNumber} />
          <Field label="Local" value={product.location} />
          <Field label="Fornecedor" value={product.supplier} />
          <Field
            label="Criado por"
            value={`${product.createdBy.name ?? product.createdBy.email} em ${formatDateBR(product.createdAt)}`}
          />
          <Field
            label="Última atualização"
            value={
              product.updatedBy
                ? `${product.updatedBy.name ?? product.updatedBy.email} em ${formatDateBR(product.updatedAt)}`
                : formatDateBR(product.updatedAt)
            }
          />
        </div>

        {product.description && (
          <Field
            label="Descrição"
            value={
              <span className="whitespace-pre-wrap">{product.description}</span>
            }
            full
          />
        )}
      </section>

      {/* ---- Movimentações ---- */}
      {includeLists && (
        <section className="print-section">
          <h2 className="print-section__title">
            Movimentações ({movements.length})
          </h2>

          {movements.length === 0 ? (
            <p className="print-empty">Nenhuma movimentação registrada.</p>
          ) : (
            <div className="print-events">
              {movements.map((m) => (
                <div key={m.id} className="print-event">
                  <div className="print-event__title">
                    <span className="print-event__title-main">
                      {TYPE_LABEL[m.type]}
                      <span className="print-event__type">
                        {" "}
                        · {m.quantity > 0 ? `+${m.quantity}` : m.quantity} un.
                      </span>
                    </span>
                    <span className="print-event__status">
                      {formatPrintCents(m.unitPriceInCents)}
                    </span>
                  </div>
                  <div className="print-event__meta">
                    <strong>{formatPrintDateTime(m.createdAt)}</strong>
                    {" · "}
                    {m.createdBy.name ?? m.createdBy.email}
                    {m.supplier && ` · ${m.supplier}`}
                  </div>
                  {m.reason && (
                    <div className="print-event__details">
                      <span className="print-event__reason">
                        Motivo: {m.reason}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Histórico de saldo ---- */}
      {includeLists && (
        <section className="print-section">
          <h2 className="print-section__title">
            Histórico de saldo ({history.length})
          </h2>

          {history.length === 0 ? (
            <p className="print-empty">Nenhum registro no histórico.</p>
          ) : (
            <div className="print-events">
              {history.map((h) => (
                <div key={h.id} className="print-event">
                  <div className="print-event__title">
                    <span className="print-event__title-main">
                      {h.oldQuantity} → {h.newQuantity} un.
                      <span className="print-event__type">
                        {" "}
                        · {HISTORY_EVENT_LABEL[getHistoryEventKind(h)]}
                      </span>
                    </span>
                  </div>
                  <div className="print-event__meta">
                    <strong>{formatPrintDateTime(h.changedAt)}</strong>
                    {" · "}
                    {h.changedBy.name ?? h.changedBy.email}
                  </div>
                  {h.reason && (
                    <div className="print-event__details">
                      <span className="print-event__reason">
                        Motivo: {h.reason}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
