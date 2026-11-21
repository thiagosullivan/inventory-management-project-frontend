// src/components/sectors/sectorPermissions.ts
import type { Sector } from "@/types/sectors.types";

/**
 * Regra de visibilidade do botão "Excluir".
 * Espelha o guard do backend (Fase 7.7).
 *
 * - Nunca deletar o Almoxarifado (isWarehouse)
 * - Só deletar setor sem dependências:
 *   users, transfersFrom/To, purchaseRequests, movementsFrom/To
 */
export function canDeleteSector(sector: Sector): boolean {
  if (sector.isWarehouse) return false;
  const c = sector._count;
  if (!c) return true; // se não veio _count, deixa o backend decidir
  return (
    c.users === 0 &&
    c.transfersFrom === 0 &&
    c.transfersTo === 0 &&
    c.purchaseRequests === 0 &&
    c.movementsFrom === 0 &&
    c.movementsTo === 0
  );
}