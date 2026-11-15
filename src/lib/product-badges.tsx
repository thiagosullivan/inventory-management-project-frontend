// src/lib/product-badges.tsx
import { Badge } from "@/components/ui/badge";

// =============================
// Estoque
// =============================

/**
 * 🔹 Badge de status do estoque.
 * - Esgotado: quantity === 0
 * - Baixo: quantity <= minStock (e minStock > 0)
 * - OK: caso contrário
 */
export function getStockBadge(quantity: number, minStock: number | null) {
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

// =============================
// Validade
// =============================

/**
 * 🔹 Badge de status da validade.
 * - Vencido: expiryDate < hoje
 * - Vencendo: expiryDate <= hoje + 30 dias
 * - OK: caso contrário
 * - null: sem data de validade (não mostra badge)
 */
export function getExpiryBadge(expiryDate: string | Date | null | undefined) {
  if (!expiryDate) return null;

  const date =
    typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  if (Number.isNaN(date.getTime())) return null;

  // Normaliza os dois lados para "meia-noite UTC" (dia puro)
  const today = new Date();
  const todayUTC = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  const targetUTC = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );

  const diffDays = Math.ceil((targetUTC - todayUTC) / 86400000);

  if (diffDays < 0) {
    return (
      <Badge variant="destructive" className="text-[10px] uppercase">
        Vencido
      </Badge>
    );
  }
  if (diffDays <= 30) {
    return (
      <Badge className="text-[10px] uppercase bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-100">
        Vence em {diffDays == 1 ? `${diffDays} dia` : `${diffDays} dias`}
      </Badge>
    );
  }
  return (
    <Badge className="text-[10px] uppercase bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-100">
      OK
    </Badge>
  );
}
