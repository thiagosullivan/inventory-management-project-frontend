// src/components/sectors/SectorFilters.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SectorFilters as Filters } from "@/types/sectors.types";

const ALL_VALUE = "__all__";

interface SectorFiltersProps {
  value: Filters;
  onChange: (next: Filters) => void;
}

export function SectorFilters({ value, onChange }: SectorFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1 max-w-[260px] min-w-[180px] flex-1">
        <Label htmlFor="sector-search">Buscar</Label>
        <Input
          id="sector-search"
          value={value.search ?? ""}
          onChange={(e) =>
            // 🔹 Fase 7.8 — SectorFilters (front) não tem paginação;
            //    `page: 1` e o `as Filters` eram resquício do backend.
            onChange({
              ...value,
              search: e.target.value || undefined,
            })
          }
          placeholder="Nome ou descrição"
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[160px]">
        <Label htmlFor="sector-type">Tipo</Label>
        <Select
          value={
            value.isWarehouse === undefined
              ? ALL_VALUE
              : String(value.isWarehouse)
          }
          onValueChange={(v) => {
            if (v === null) return;
            onChange({
              ...value,
              isWarehouse: v === ALL_VALUE ? undefined : v === "true",
            });
          }}
        >
          <SelectTrigger id="sector-type">
            <SelectValue placeholder="Todos">
              {value.isWarehouse === undefined
                ? "Todos"
                : value.isWarehouse
                  ? "Almoxarifado"
                  : "Setor comum"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            <SelectItem value="true">Almoxarifado</SelectItem>
            <SelectItem value="false">Setor comum</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 min-w-[140px]">
        <Label htmlFor="sector-status">Status</Label>
        <Select
          value={
            value.isActive === undefined ? ALL_VALUE : String(value.isActive)
          }
          onValueChange={(v) => {
            if (v === null) return;
            onChange({
              ...value,
              isActive: v === ALL_VALUE ? undefined : v === "true",
            });
          }}
        >
          <SelectTrigger id="sector-status">
            <SelectValue placeholder="Todos">
              {value.isActive === undefined
                ? "Todos"
                : value.isActive
                  ? "Ativo"
                  : "Inativo"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>Todos</SelectItem>
            <SelectItem value="true">Ativo</SelectItem>
            <SelectItem value="false">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
