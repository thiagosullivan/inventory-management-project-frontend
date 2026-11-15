// src/lib/report-badges.tsx
import { Badge } from "@/components/ui/badge";

// =============================
// Fulfillment (R1)
// =============================

export type FulfillmentBadgeVariant = "success" | "warning" | "info" | "muted";

export interface FulfillmentBadgeInfo {
  label: string;
  className: string;
}

/**
 * 🔹 Faixas:
 *  - >= 90% → verde (success)
 *  - >= 50% → amarelo (warning)
 *  - >  0%  → laranja (info)
 *  - == 0%  → cinza (muted)
 */
export function getFulfillmentBadge(pct: number): FulfillmentBadgeInfo {
  const safe = Number.isFinite(pct) ? pct : 0;
  const label = `${safe.toFixed(1)}%`;

  if (safe >= 90) {
    return {
      label,
      className: "bg-emerald-100 text-emerald-900 border-emerald-300",
    };
  }
  if (safe >= 50) {
    return {
      label,
      className: "bg-amber-100 text-amber-900 border-amber-300",
    };
  }
  if (safe > 0) {
    return {
      label,
      className: "bg-orange-100 text-orange-900 border-orange-300",
    };
  }
  return {
    label,
    className: "bg-zinc-200 text-zinc-800 border-zinc-300",
  };
}

export function FulfillmentBadge({ pct }: { pct: number }) {
  const info = getFulfillmentBadge(pct);
  return (
    <Badge variant="outline" className={info.className}>
      {info.label}
    </Badge>
  );
}

// =============================
// Prioridade (R2)
// =============================

export function PriorityBadge() {
  return (
    <Badge variant="outline" className="bg-red-100 text-red-900 border-red-300">
      Prioritário
    </Badge>
  );
}
