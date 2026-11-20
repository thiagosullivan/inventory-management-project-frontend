import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchSectorOptions } from "@/services/sectors";
import type {
  UserFilters as UserFiltersType,
  UserRole,
} from "@/types/users.types";
import { useQuery } from "@tanstack/react-query";

const ALL = "__all__";

interface UserFiltersProps {
  value: UserFiltersType;
  onChange: (next: UserFiltersType) => void;
}

export function UserFilters({ value, onChange }: UserFiltersProps) {
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors", "options"],
    queryFn: fetchSectorOptions,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Busca */}
      <div className="flex-1 min-w-[220px]">
        <label className="text-xs text-muted-foreground">Buscar</label>
        <Input
          placeholder="Nome ou email..."
          value={value.search ?? ""}
          onChange={(e) =>
            onChange({ ...value, search: e.target.value, page: 1 })
          }
        />
      </div>

      {/* Setor */}
      <div className="min-w-[180px]">
        <label className="text-xs text-muted-foreground">Setor</label>
        <Select
          value={value.sectorId ?? ALL}
          onValueChange={(v) =>
            onChange({
              ...value,
              sectorId: v == null || v === ALL ? undefined : v, // 🔹 normaliza null
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Role */}
      <div className="min-w-[140px]">
        <label className="text-xs text-muted-foreground">Cargo</label>
        <Select
          value={value.role ?? ALL}
          onValueChange={(v) =>
            onChange({
              ...value,
              role: v == null || v === ALL ? undefined : (v as UserRole), // 🔹 normaliza null
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="STAFF">Staff</SelectItem>
            <SelectItem value="MANAGER">Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="min-w-[140px]">
        <label className="text-xs text-muted-foreground">Status</label>
        <Select
          value={value.isActive === undefined ? ALL : String(value.isActive)}
          onValueChange={(v) =>
            onChange({
              ...value,
              isActive: v == null || v === ALL ? undefined : v === "true", // 🔹 normaliza null
              page: 1,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            <SelectItem value="true">Ativos</SelectItem>
            <SelectItem value="false">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}