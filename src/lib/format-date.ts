export function formatDate(iso?: string | Date | null): string {
  if (!iso) return "-";

  const date = typeof iso === "string" ? new Date(iso) : iso;

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

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
