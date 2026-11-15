// src/lib/format-date.ts

/**
 * 🔹 Formata data pura (sem hora) — expiryDate, birthDate, etc.
 * Usa UTC pra não "voltar um dia" por causa do fuso (BRT = UTC-3).
 */
export function formatDate(iso?: string | Date | null): string {
  if (!iso) return "-";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC", // 🔹 data pura: sempre UTC
  }).format(date);
}

/**
 * 🔹 Formata data + hora — createdAt, changedAt, confirmedAt, etc.
 * Usa BRT (fuso do usuário) porque o horário importa.
 */
export function formatDateTime(iso?: string | Date | null): string {
  if (!iso) return "-";
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
