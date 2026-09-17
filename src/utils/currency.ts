/**
 * Formata centavos para string de moeda BRL.
 * 1990 → "R$ 19,90"
 */
export function formatCentsToBRL(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

/**
 * Converte string de input (usuário digita "19,90" ou "19.90") para centavos.
 * "19,90" → 1990
 */
export function parseBRLToCents(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/\./g, "").replace(",", ".").trim();
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) return null;
  return Math.round(parsed * 100);
}

/**
 * Converte centavos para número decimal (para exibir em input).
 * 1990 → "19,90"
 */
export function centsToInputValue(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
