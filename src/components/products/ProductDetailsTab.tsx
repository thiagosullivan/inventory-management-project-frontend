import { formatDate } from "@/lib/format-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductDetailResponse } from "@/types/products.types";
import { formatCentsToBRL } from "@/utils/currency";

interface ProductDetailsTabProps {
  product: ProductDetailResponse;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}

export function ProductDetailsTab({ product }: ProductDetailsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field
            label="Último preço de compra"
            value={formatCentsToBRL(product.priceInCents)}
          />
          <Field
            label="Média ponderada (custo em estoque)"
            value={formatCentsToBRL(product.avgPriceInCents)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estoque</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Quantidade atual" value={product.quantity} />
          <Field label="Estoque mínimo" value={product.minStock ?? "—"} />
          <Field label="Estoque máximo" value={product.maxStock ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Validade e lote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Validade" value={formatDate(product.expiryDate)} />
          <Field label="Lote" value={product.batchNumber} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label="Local" value={product.location} />
          <Field label="Fornecedor" value={product.supplier} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">
            {product.description || "—"}
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Auditoria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="Criado por"
            value={`${product.createdBy.name ?? product.createdBy.email} em ${formatDate(product.createdAt)}`}
          />
          <Field
            label="Última atualização"
            value={
              product.updatedBy
                ? `${product.updatedBy.name ?? product.updatedBy.email} em ${formatDate(product.updatedAt)}`
                : formatDate(product.updatedAt)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
