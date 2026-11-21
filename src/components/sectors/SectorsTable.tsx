// src/components/sectors/SectorsTable.tsx
import { Building2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Sector } from "@/types/sectors.types";
import { SectorStatusBadge } from "./SectorStatusBadge";
import { canDeleteSector } from "./sectorPermissions";

interface SectorsTableProps {
  sectors: Sector[];
  onEdit: (sector: Sector) => void;
  onDelete: (sector: Sector) => void;
}

export function SectorsTable({ sectors, onEdit, onDelete }: SectorsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dependências</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sectors.map((sector) => {
          const deletable = canDeleteSector(sector);
          const c = sector._count;
          const depParts: string[] = [];
          if (c?.users) depParts.push(`${c.users} usuário(s)`);
          if (c?.transfersFrom || c?.transfersTo)
            depParts.push(
              `${(c?.transfersFrom ?? 0) + (c?.transfersTo ?? 0)} remessa(s)`,
            );
          if (c?.purchaseRequests)
            depParts.push(`${c.purchaseRequests} pedido(s)`);
          if (c?.movementsFrom || c?.movementsTo)
            depParts.push(
              `${(c?.movementsFrom ?? 0) + (c?.movementsTo ?? 0)} movimentação(ões)`,
            );

          return (
            <TableRow key={sector.id}>
              <TableCell className="font-medium">{sector.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {sector.description ?? "—"}
              </TableCell>
              <TableCell>
                {sector.isWarehouse ? (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    Almoxarifado
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">Comum</span>
                )}
              </TableCell>
              <TableCell>
                <SectorStatusBadge isActive={sector.isActive} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {depParts.length > 0 ? depParts.join(" · ") : "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(sector)}
                    title="Editar"
                    className="cursor-pointer"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {deletable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(sector)}
                      title="Excluir (sem dependências)"
                      className="cursor-pointer text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}