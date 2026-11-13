// src/lib/shorten-id.ts

/**
 * 🔹 Encurta um ID (CUID/UUID) pra exibição em listas.
 * - Mostra os primeiros 8 caracteres + "…".
 * - Se o ID for menor ou igual a 8, retorna ele inteiro (sem "…").
 *
 * Uso em listas. No dialog de detalhes, mostrar o ID completo com botão "copiar".
 */
export function shortenId(id: string | null | undefined): string {
  if (!id) return "—";
  if (id.length <= 8) return id;
  return `${id.slice(0, 8)}…`;
}
