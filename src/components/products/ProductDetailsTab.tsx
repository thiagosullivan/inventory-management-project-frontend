import { formatDate } from "@/lib/format-date";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductDetailResponse } from "@/types/products.types";
import { formatCentsToBRL } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";

interface ProductDetailsTabProps {
  product: ProductDetailResponse;
}

/**
 * 🔹 Badge de status do estoque.
 * - Esgotado: quantity === 0
 * - Baixo: quantity <= minStock (e minStock > 0)
 * - OK: caso contrário
 */
function getStockBadge(quantity: number, minStock: number | null) {
  if (quantity <= 0) {
    return (
      <Badge variant="destructive" className="text-[10px] uppercase">
        Esgotado
      </Badge>
    );
  }
  if (minStock !== null && minStock > 0 && quantity <= minStock) {
    return (
      <Badge className="text-[10px] uppercase bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-100">
        Estoque baixo
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] uppercase bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-100">
      OK
    </Badge>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "—" ||
    value === "-"
  ) {
    return null; // 🔹 esconde o campo vazio
  }
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
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
          {/* 🔹 Quantidade atual em destaque + badge de status */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Quantidade atual</p>
              <p className="text-2xl font-bold leading-tight">
                {product.quantity}
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  un.
                </span>
              </p>
            </div>
            {getStockBadge(product.quantity, product.minStock)}
          </div>

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
