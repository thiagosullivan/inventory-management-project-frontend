// src/pages/SectorsPage.tsx
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectorFilters } from "@/components/sectors/SectorFilters";
import { SectorFormDialog } from "@/components/sectors/SectorFormDialog";
import { SectorsTable } from "@/components/sectors/SectorsTable";
import { DeleteSectorDialog } from "@/components/sectors/DeleteSectorDialog";
import { useSectors } from "@/hooks/useSectors";
import { getApiErrorMessage } from "@/lib/api-error";
import type {
  Sector,
  SectorFilters as SectorFiltersType,
} from "@/types/sectors.types";
import { useNavigate } from "react-router-dom";

export default function SectorsPage() {
  const [filters, setFilters] = useState<SectorFiltersType>({});
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Sector | null>(null);
  const [deleting, setDeleting] = useState<Sector | null>(null);

  const { data, isLoading, isError, error, refetch } = useSectors(filters);

  const navigate = useNavigate();

  const sectors = data?.sectors ?? [];

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(sector: Sector) {
    setFormMode("edit");
    setEditing(sector);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar
      </Button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Setores</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os setores. Setores com dependências não podem ser
            excluídos — apenas inativados.
          </p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer min-h-9 p-2">
          <Plus className="h-4 w-4 mr-2" />
          Novo setor
        </Button>
      </div>

      <SectorFilters value={filters} onChange={setFilters} />

      {isLoading && (
        <p className="text-sm text-muted-foreground">Carregando setores...</p>
      )}

      {isError && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="text-destructive">
            {getApiErrorMessage(error, "Erro ao carregar setores.")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 cursor-pointer"
            onClick={() => refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {sectors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum setor encontrado com os filtros atuais.
            </p>
          ) : (
            <SectorsTable
              sectors={sectors}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              {sectors.length} setor(es)
            </span>
          </div>
        </>
      )}

      <SectorFormDialog
        key={`${formMode}-${editing?.id ?? "new"}-${formOpen ? "open" : "closed"}`}
        mode={formMode}
        sector={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      <DeleteSectorDialog
        sector={deleting}
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
