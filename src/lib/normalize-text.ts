// src/lib/normalize-text.ts

/**
 * Normaliza texto pra busca: minúsculas + sem acentos + trim.
 * Usado pra comparar termos digitados com campos do catálogo no client.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
