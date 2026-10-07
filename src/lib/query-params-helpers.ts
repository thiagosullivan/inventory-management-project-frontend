/**
 * Helpers de leitura de URLSearchParams.
 * Compartilhados entre os serializers de /products e /stock.
 *
 * Convenções:
 * - String vazia ou só espaços → undefined
 * - Números não-parseáveis → undefined
 * - Booleanos só aceitam "true"/"false" literais
 * - getBooleanTrueOnly só aceita "true" (pra flags que o backend
 *   interpreta como "só liga quando true")
 */

export function getString(
  params: URLSearchParams,
  key: string,
): string | undefined {
  const value = params.get(key);
  if (!value || value.trim() === "") return undefined;
  return value;
}

export function getNumber(
  params: URLSearchParams,
  key: string,
): number | undefined {
  const raw = params.get(key);
  if (!raw) return undefined;
  const num = Number(raw);
  if (Number.isNaN(num)) return undefined;
  return num;
}

export function getBoolean(
  params: URLSearchParams,
  key: string,
): boolean | undefined {
  const raw = params.get(key);
  if (raw === "true") return true;
  if (raw === "false") return false;
  return undefined;
}

/**
 * Só retorna true se o param for literalmente "true".
 * Pra booleanos que o backend só entende como "true"
 * (isExpiring, isLowStock, isExpired).
 */
export function getBooleanTrueOnly(
  params: URLSearchParams,
  key: string,
): boolean | undefined {
  const raw = params.get(key);
  if (raw === "true") return true;
  return undefined;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
